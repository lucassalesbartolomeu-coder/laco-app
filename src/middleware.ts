/**
 * Middleware de autenticação do Laço.
 * Adaptado do Colo — mesma lógica JWT, rotas Laço.
 *
 * IMPORTANTE: Cookie prefix usa NODE_ENV (igual ao auth.ts).
 * Ambos devem usar a mesma lógica para evitar mismatch.
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas que requerem autenticação
const PROTECTED_PATHS = [
  "/app",
  "/app/dashboard",
  "/app/presentes",
  "/app/convidados",
  "/app/fornecedores",
  "/app/orcamento",
  "/app/configuracoes",
  "/app/saques",
  "/app/album",
];

// Rotas de auth — redireciona para dashboard se já logado
const AUTH_PATHS = ["/login", "/cadastro", "/esqueci-senha"];

// Rotas de API protegidas (requerem autenticação)
const PROTECTED_API_PATHS = [
  "/api/wedding",
  "/api/gifts",
  "/api/guests",
  "/api/vendors",
  "/api/budget",
  "/api/withdrawals",
  "/api/upload",
  "/api/user",
];

// Rotas de API públicas (não requerem autenticação)
// /api/payments/orders e /api/payments/webhook são públicas (convidados)
// /api/auth é gerenciado pelo NextAuth

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
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
      return NextResponse.redirect(new URL("/app/dashboard", req.url));
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
     * - public folder files
     * - /lista/* (site público do casal — sem auth)
     * - /api/auth/* (NextAuth)
     * - /api/payments/* (webhooks e pedidos — sem auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|lista/|api/auth/|api/payments/).*)",
  ],
};
