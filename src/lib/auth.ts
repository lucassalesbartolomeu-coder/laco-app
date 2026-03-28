/**
 * NextAuth config do Laço.
 * Adaptado do Colo — mesma lógica de JWT, cookie prefix, PrismaAdapter fix, rate limit.
 * Mudanças: branding Laço, rotas do Laço, hashedPassword field.
 */
import { NextAuthOptions, getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { cookies, headers } from "next/headers";

// Auto-detect NEXTAUTH_URL para Vercel preview/development
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
  console.log("[auth] NEXTAUTH_URL auto-set to:", process.env.NEXTAUTH_URL);
}

// Usa NODE_ENV para determinar se é HTTPS — garante que Edge runtime (middleware.ts)
// e Node.js runtime (auth.ts) usem o mesmo cookie prefix.
const isSecure = process.env.NODE_ENV === "production";

// Wrapper do PrismaAdapter que remove métodos de sessão DB.
// Com strategy:"jwt" + PrismaAdapter, getServerSession chama adapter.getSessionAndUser
// que retorna null (sem DB session para JWT), fazendo a sessão vir como {}.
// Removendo esses métodos, o NextAuth vai direto para JWT.
function makeAdapter() {
  const base = PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = base as any;
  delete adapter.createSession;
  delete adapter.getSessionAndUser;
  delete adapter.updateSession;
  delete adapter.deleteSession;
  return adapter;
}

export const authOptions: NextAuthOptions = {
  adapter: makeAdapter() as NextAuthOptions["adapter"],
  debug: process.env.NODE_ENV === "development",

  cookies: {
    sessionToken: {
      name: isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isSecure },
    },
    callbackUrl: {
      name: isSecure ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isSecure },
    },
    csrfToken: {
      name: isSecure ? "__Secure-next-auth.csrf-token" : "next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isSecure },
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },

  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : (() => {
          console.error("[auth] ⚠️ GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET ausente — Google login DESABILITADO");
          return [];
        })()),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        // Rate limit: 5 tentativas por email a cada 15 minutos
        const allowed = await rateLimit(
          `login:${credentials.email.toLowerCase().trim()}`,
          5,
          15 * 60 * 1000
        );
        if (!allowed) {
          throw new Error("Muitas tentativas. Aguarde 15 minutos.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) throw new Error("Email ou senha incorretos");

        // Suporta tanto campo `password` (legado) quanto `hashedPassword` (novo)
        const storedHash = user.hashedPassword ?? user.password;
        if (!storedHash) throw new Error("USE_OAUTH");

        const isValid = await bcrypt.compare(credentials.password, storedHash);
        if (!isValid) throw new Error("Email ou senha incorretos");

        return { id: user.id, name: user.name, email: user.email, image: user.image ?? null };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch { /* invalid URL */ }
      return `${baseUrl}/app/dashboard`;
    },

    async signIn({ user, account }) {
      // Bloqueia auto-link: impede Google de sobrescrever conta credentials existente
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });
        if (existing && !existing.accounts.some((a) => a.provider === "google")) {
          return "/login?error=EmailExistente";
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Buscar role do usuário
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "COUPLE";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as typeof session.user & { role: string }).role = token.role as string;
      }
      return session;
    },
  },
};

export async function getAuthSession() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) return null;
    return session;
  } catch (e) {
    console.error("[auth] getServerSession error:", e);
    return null;
  }
}

/**
 * Auth check alternativo via getToken — mais confiável em Route Handlers.
 */
export async function getAuthSessionFromToken() {
  try {
    const cookieStore = cookies();
    const headerStore = headers();
    const allCookies = cookieStore.getAll();

    const cookieHeader = allCookies
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");
    const cookieMap = Object.fromEntries(
      allCookies.map((c: { name: string; value: string }) => [c.name, c.value])
    );

    const reqLike = {
      headers: {
        get: (name: string) => {
          if (name === "cookie") return cookieHeader;
          return headerStore.get(name) ?? null;
        },
        cookie: cookieHeader,
      },
      cookies: cookieMap,
    } as unknown as Parameters<typeof getToken>[0]["req"];

    const cookieNames = [
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ];

    let token = null;
    for (const cookieName of cookieNames) {
      token = await getToken({
        req: reqLike,
        secret: process.env.NEXTAUTH_SECRET!,
        cookieName,
      });
      if (token) break;
    }

    if (!token?.id && !token?.sub) return null;
    const userId = (token.id as string) ?? (token.sub as string);

    return {
      user: {
        id: userId,
        email: token.email as string,
        name: token.name as string,
        role: (token.role as string) ?? "COUPLE",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (e) {
    console.error("[auth] getAuthSessionFromToken error:", e);
    return null;
  }
}
