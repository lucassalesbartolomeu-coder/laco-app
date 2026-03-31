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
    <div className="min-h-screen flex flex-col lg:flex-row bg-ivory">
      {/* LEFT SIDE: Dark hero section with logo & tagline (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-midnight flex-col justify-between p-12">
        {/* Logo */}
        <Link href="/" className="font-display text-3xl tracking-[0.3em] uppercase text-ivory hover:opacity-80 transition">
          LAÇO
        </Link>

        {/* Tagline */}
        <div>
          <h2 className="font-body text-xl font-medium text-ivory mb-3">
            {isPlanner ? "Gerencie seus casamentos com elegância" : "Seu casamento em um só lugar"}
          </h2>
          <p className="font-body text-sm text-champagne/80 leading-relaxed max-w-sm">
            {isPlanner
              ? "Painel completo para cerimonialistas. Gerencie fornecedores, orçamentos, cronogramas e comunicação."
              : "Organize os detalhes do seu grande dia. Planejar nunca foi tão fácil."}
          </p>
        </div>

        {/* Trust badges */}
        <div className="space-y-3 text-sm text-champagne/70 font-body">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Completamente criptografado
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Compatível com LGPD
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form (full width on mobile, half on desktop) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-12 lg:px-8">
        {/* Mobile logo — visible only on small screens */}
        <Link href="/" className="lg:hidden font-display text-2xl tracking-[0.3em] uppercase text-midnight mb-8 hover:opacity-70 transition">
          LAÇO
        </Link>

        {/* Referral banner */}
        {refCode && isRegister && (
          <div className="w-full max-w-md mb-6 bg-gold/10 border border-gold/20 rounded-xl p-4 text-center">
            <p className="font-body text-sm text-midnight">
              Você foi indicado para o Laço! Crie sua conta gratuita abaixo.
            </p>
          </div>
        )}

        {/* User type selector */}
        <div className="w-full max-w-md mb-8">
          <div className="flex gap-2 bg-fog rounded-xl p-1">
            <button
              type="button"
              onClick={() => setUserType("couple")}
              className={`flex-1 py-3 rounded-lg font-body font-medium text-sm transition-all ${
                userType === "couple"
                  ? "bg-midnight text-ivory shadow-sm"
                  : "bg-transparent text-midnight/60 hover:text-midnight"
              }`}
            >
              Casal
            </button>
            <button
              type="button"
              onClick={() => setUserType("planner")}
              className={`flex-1 py-3 rounded-lg font-body font-medium text-sm transition-all ${
                userType === "planner"
                  ? "bg-midnight text-ivory shadow-sm"
                  : "bg-transparent text-midnight/60 hover:text-midnight"
              }`}
            >
              Cerimonialista
            </button>
          </div>
        </div>

        {/* Form container */}
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-body text-2xl font-medium text-midnight mb-2">
              {isRegister
                ? isPlanner ? "Crie sua conta profissional" : "Crie sua conta"
                : "Entre na sua conta"}
            </h1>
            <p className="font-body text-sm text-stone">
              {isRegister
                ? mode === "register" && !isPlanner ? "Crie sua conta gratuitamente, sem cartão de crédito" : "Cadastre-se para começar"
                : "Bem-vindo de volta ao Laço"}
            </p>
          </div>

          {/* Mode toggle for register/login */}
          {!refCode && (
            <div className="flex gap-1 bg-fog rounded-lg p-1 mb-8">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-2.5 rounded-md font-body text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-ivory text-midnight shadow-sm"
                    : "bg-transparent text-stone hover:text-midnight"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 py-2.5 rounded-md font-body text-sm font-medium transition-all ${
                  mode === "register"
                    ? "bg-ivory text-midnight shadow-sm"
                    : "bg-transparent text-stone hover:text-midnight"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field — register only */}
            {isRegister && (
              <div>
                <label className="block font-body text-xs font-medium text-midnight/70 mb-1.5 uppercase tracking-wide">
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
                  className="w-full px-4 py-3 rounded-xl border border-midnight/10 font-body text-sm text-midnight placeholder-stone/60 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition bg-ivory"
                  placeholder={isPlanner ? "Mariana Silva" : "Ana Santos"}
                />
              </div>
            )}

            {/* Company name — planner + register only */}
            {isRegister && isPlanner && (
              <div>
                <label className="block font-body text-xs font-medium text-midnight/70 mb-1.5 uppercase tracking-wide">
                  Nome da empresa
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoComplete="organization"
                  className="w-full px-4 py-3 rounded-xl border border-midnight/10 font-body text-sm text-midnight placeholder-stone/60 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition bg-ivory"
                  placeholder="Seu escritório ou empresa"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block font-body text-xs font-medium text-midnight/70 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-midnight/10 font-body text-sm text-midnight placeholder-stone/60 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition bg-ivory"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-body text-xs font-medium text-midnight/70 uppercase tracking-wide">
                  Senha
                </label>
                {mode === "login" && (
                  <Link href="/recuperar-senha" className="font-body text-xs text-gold hover:text-gold/80 transition">
                    Esqueci
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
                className="w-full px-4 py-3 rounded-xl border border-midnight/10 font-body text-sm text-midnight placeholder-stone/60 focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition bg-ivory"
                placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
              />
            </div>

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="font-body text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Primary button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6 bg-midnight text-ivory rounded-xl font-body font-medium hover:bg-midnight/90 active:scale-[0.99] focus:ring-2 focus:ring-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Carregando..."
                : mode === "register"
                  ? isPlanner ? "Criar conta profissional" : "Criar minha conta"
                  : "Entrar"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-2 my-6">
              <div className="flex-1 h-px bg-midnight/10" />
              <span className="font-body text-xs text-stone/70">ou</span>
              <div className="flex-1 h-px bg-midnight/10" />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 h-12 bg-white border border-midnight/10 text-midnight rounded-xl font-body font-medium hover:bg-fog transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </button>
          </form>

          {/* Planner upgrade notice */}
          {isPlanner && isRegister && (
            <p className="font-body text-xs text-stone text-center mt-6">
              Precisa de cadastro completo com perfil público?{" "}
              <Link href="/registro/cerimonialista" className="text-gold hover:text-gold/80 transition font-medium">
                Acesse aqui
              </Link>
            </p>
          )}

          {/* Switch mode link */}
          {!refCode && (
            <p className="text-center font-body text-sm text-stone mt-6">
              {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-midnight font-medium hover:text-gold transition"
              >
                {mode === "login" ? "Criar agora" : "Entrar"}
              </button>
            </p>
          )}

          {/* Trust footer — register only */}
          {isRegister && !isPlanner && (
            <p className="text-center font-body text-xs text-stone/60 mt-4">
              Sem cartão de crédito · Cancele a qualquer momento
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
        <div className="min-h-screen bg-ivory flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
