"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type UserType = "couple" | "planner";
type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("couple");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
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

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Minimal nav */}
      <nav className="px-6 py-5">
        <Link href="/" className="font-heading text-2xl font-semibold text-verde-noite tracking-wide">
          Laço
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl font-semibold text-verde-noite mb-2">
              {mode === "login" ? "Bem-vindo de volta" : "Comece agora"}
            </h1>
            <p className="font-body text-verde-noite/55 text-base">
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
                  ? "bg-verde-noite text-white shadow-sm"
                  : "text-verde-noite/50 hover:text-verde-noite"
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
                  ? "bg-verde-noite text-white shadow-sm"
                  : "text-verde-noite/50 hover:text-verde-noite"
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
                    ? "border-teal text-teal"
                    : "border-transparent text-verde-noite/40 hover:text-verde-noite/60"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`pb-3 font-body text-sm font-medium border-b-2 transition-all -mb-px ${
                  mode === "register"
                    ? "border-teal text-teal"
                    : "border-transparent text-verde-noite/40 hover:text-verde-noite/60"
                }`}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-body text-sm font-medium text-verde-noite/70 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-verde-noite placeholder-verde-noite/30 focus:border-teal focus:ring-2 focus:ring-teal/10 outline-none transition"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-body text-sm font-medium text-verde-noite/70">
                    Senha
                  </label>
                  {mode === "login" && (
                    <Link href="/recuperar-senha" className="font-body text-xs text-teal hover:underline">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-verde-noite placeholder-verde-noite/30 focus:border-teal focus:ring-2 focus:ring-teal/10 outline-none transition"
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
                className="w-full py-3.5 bg-copper text-white rounded-xl font-body font-medium hover:bg-copper/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading
                  ? "Aguarde..."
                  : mode === "register"
                    ? isPlanner ? "Criar conta profissional" : "Criar conta gratuita"
                    : "Entrar"}
              </button>
            </form>

            {/* Planner full register notice */}
            {isPlanner && mode === "register" && (
              <p className="font-body text-xs text-verde-noite/40 text-center mt-4 leading-relaxed">
                Para cadastro profissional completo com perfil público,{" "}
                <Link href="/registro/cerimonialista" className="text-teal hover:underline">
                  use este formulário
                </Link>
              </p>
            )}
          </div>

          {/* Switch mode link */}
          <p className="text-center font-body text-sm text-verde-noite/50 mt-6">
            {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-teal hover:underline font-medium"
            >
              {mode === "login" ? "Criar agora, é grátis" : "Entrar"}
            </button>
          </p>

          {/* Trust note */}
          {mode === "register" && (
            <p className="text-center font-body text-xs text-verde-noite/35 mt-4">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
