"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

type UserType = "couple" | "planner";
type Mode = "login" | "register";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<UserType>("couple");
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
      setMode("register");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (name.trim().length < 2) {
          setError("Por favor, informe seu nome (mínimo 2 caracteres).");
          setLoading(false);
          return;
        }

        const payload: Record<string, unknown> = {
          email,
          password,
          name: name.trim(),
          role: userType === "planner" ? "PLANNER" : "COUPLE",
        };

        if (userType === "planner" && companyName) {
          payload.plannerData = { companyName };
        }

        // Passa código de indicação se existir
        if (refCode) {
          payload.referredBy = refCode;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erro ao criar conta");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === "register" ? "Erro ao entrar após cadastro" : "Email ou senha incorretos");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "PLANNER" || role === "ADMIN") {
        router.push("/cerimonialista/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  const isPlanner = userType === "planner";
  const isRegister = mode === "register";

  return (
    <div className="min-h-screen bg-fog flex flex-col">
      {/* Banner sutil quando vem via indicação */}
      {refCode && isRegister && (
        <div className="w-full bg-[#1A1F3A]/10 border-b border-[#1A1F3A]/20 py-2.5 px-4 text-center">
          <p className="font-body text-sm text-[#1A1F3A]">
            Você foi indicado para o Laço! Crie sua conta gratuita abaixo.
          </p>
        </div>
      )}

      {/* Minimal nav */}
      <nav className="px-6 py-5">
        <Link href="/" className="font-display text-2xl font-semibold text-midnight tracking-wide">
          Laço
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl font-semibold text-midnight mb-2">
              {mode === "login" ? "Bem-vindo de volta" : "Comece agora"}
            </h1>
            <p className="font-body text-midnight/55 text-base">
              {mode === "login"
                ? "Entre na sua conta para continuar"
                : "Crie sua conta gratuitamente"}
            </p>
          </div>

          {/* User type pills */}
          <div className="flex gap-2 mb-8 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setUserType("couple")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
                userType === "couple"
                  ? "bg-midnight text-white shadow-sm"
                  : "text-midnight/50 hover:text-midnight"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Sou casal
            </button>
            <button
              type="button"
              onClick={() => setUserType("planner")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
                userType === "planner"
                  ? "bg-midnight text-white shadow-sm"
                  : "text-midnight/50 hover:text-midnight"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Sou cerimonialista
            </button>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            {/* Mode tabs */}
            <div className="flex border-b border-gray-100 mb-7 -mx-8 px-8">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`pb-3 mr-6 font-body text-sm font-medium border-b-2 transition-all -mb-px ${
                  mode === "login"
                    ? "border-midnight text-midnight"
                    : "border-transparent text-midnight/40 hover:text-midnight/60"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`pb-3 font-body text-sm font-medium border-b-2 transition-all -mb-px ${
                  mode === "register"
                    ? "border-midnight text-midnight"
                    : "border-transparent text-midnight/40 hover:text-midnight/60"
                }`}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field — register only */}
              {isRegister && (
                <div>
                  <label className="block font-body text-sm font-medium text-midnight/70 mb-1.5">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={50}
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-midnight placeholder-stone/30 focus:border-midnight focus:ring-2 focus:ring-midnight/10 outline-none transition"
                    placeholder={isPlanner ? "Ex: Mariana Silva" : "Ex: Ana"}
                  />
                </div>
              )}

              {/* Company name — planner + register only */}
              {isRegister && isPlanner && (
                <div>
                  <label className="block font-body text-sm font-medium text-midnight/70 mb-1.5">
                    Nome da empresa
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoComplete="organization"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-midnight placeholder-stone/30 focus:border-midnight focus:ring-2 focus:ring-midnight/10 outline-none transition"
                    placeholder="Nome do seu escritório ou empresa"
                  />
                </div>
              )}

              <div>
                <label className="block font-body text-sm font-medium text-midnight/70 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-midnight placeholder-stone/30 focus:border-midnight focus:ring-2 focus:ring-midnight/10 outline-none transition"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-body text-sm font-medium text-midnight/70">
                    Senha
                  </label>
                  {mode === "login" && (
                    <Link href="/recuperar-senha" className="font-body text-xs text-midnight hover:underline">
                      Esqueci minha senha
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-midnight placeholder-stone/30 focus:border-midnight focus:ring-2 focus:ring-midnight/10 outline-none transition"
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-body text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gold text-white rounded-xl font-body font-medium hover:bg-gold/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading
                  ? "Aguarde..."
                  : mode === "register"
                    ? isPlanner ? "Criar conta profissional" : "Criar conta gratuita"
                    : "Entrar"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="font-body text-xs text-midnight/30 flex-shrink-0">ou continue com</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Google button — cosmetic, coming soon */}
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  aria-label="Entrar com Google — em breve"
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 bg-white font-body text-sm font-medium text-midnight/40 cursor-not-allowed select-none"
                >
                  {/* Google "G" logo */}
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                      opacity="0.4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                      opacity="0.4"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                      opacity="0.4"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                      opacity="0.4"
                    />
                  </svg>
                  Continuar com Google
                </button>
                {/* Tooltip */}
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-midnight px-3 py-1.5 font-body text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  Em breve
                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-verde-noite" />
                </span>
              </div>
            </form>

            {/* Planner full register notice */}
            {isPlanner && isRegister && (
              <p className="font-body text-xs text-midnight/40 text-center mt-4 leading-relaxed">
                Para cadastro profissional completo com perfil público,{" "}
                <Link href="/registro/cerimonialista" className="text-midnight hover:underline">
                  use este formulário
                </Link>
              </p>
            )}
          </div>

          {/* Switch mode link */}
          <p className="text-center font-body text-sm text-midnight/50 mt-6">
            {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-midnight hover:underline font-medium"
            >
              {mode === "login" ? "Criar agora, é grátis" : "Entrar"}
            </button>
          </p>

          {/* Trust note */}
          {isRegister && (
            <p className="text-center font-body text-xs text-midnight/35 mt-4">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-fog flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
