/**
 * Middleware de autenticação do Laço.
 * CORRIGIDO: rotas reais são /dashboard/*, /casamento/*, /cerimonialista/*, /perfil/*
 *
 * IMPORTANTE: Cookie prefix usa NODE_ENV (igual ao auth.ts).
 * Ambos devem usar a mesma lógica para evitar mismatch.
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas que requerem autenticação (rotas reais do app)
const PROTECTED_PATHS = [
  "/dashboard",
  "/casamento",
  "/cerimonialista",
  "/perfil",
  "/onboarding",
];

// Rotas de auth — redireciona para dashboard se já logado
const AUTH_PATHS = ["/login", "/cadastro", "/esqueci-senha"];

// Rotas de API protegidas (requerem autenticação)
const PROTECTED_API_PATHS = [
  "/api/weddings",
  "/api/wedding",
  "/api/gifts",
  "/api/guests",
  "/api/vendors",
  "/api/budget",
  "/api/withdrawals",
  "/api/upload",
  "/api/user",
  "/api/profile",
  "/api/planner",
  "/api/ocr",
  "/api/ai",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Mesma lógica do auth.ts — usa NODE_ENV para cookie prefix
  const isSecure = process.env.NODE_ENV === "production";
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  let token = null;
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!,
      cookieName,
    });
  } catch (e) {
    console.error("[middleware] getToken error:", e);
  }

  const isLoggedIn = !!token;

  // ─── Rotas de app protegidas ─────────────────────────────
  if (isProtectedPath(pathname)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ─── Rotas de auth — redireciona se já logado ────────────
  if (isAuthPath(pathname)) {
    if (isLoggedIn) {
      // Redireciona para dashboard correto baseado no role
      const role = (token as { role?: string })?.role;
      const dest =
        role === "PLANNER" ? "/cerimonialista/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // ─── APIs protegidas ─────────────────────────────────────
  if (isProtectedApiPath(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (svg, png, jpg, etc)
     * - /[slug]/* (site público do casal — sem auth)
     * - /api/auth/* (NextAuth)
     * - /api/payments/* (webhooks e pedidos — sem auth)
     * - /api/public/* (APIs públicas)
     * - /api/health (health check)
     * - /api/webhooks/* (webhooks externos)
     * - /blog/* (conteúdo público)
     * - /casamento-em-* (landing pages públicas)
     * - /contratos/* (visualização pública de contratos)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/auth/|api/payments/|api/public/|api/health|api/webhooks/|blog/|casamento-em-|contratos/).*)",
  ],
};
