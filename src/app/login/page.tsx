"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
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
        setError("Email ou senha incorretos");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl font-semibold text-verde-noite">
            Laco
          </h1>
          <p className="text-verde-noite/60 mt-2">
            Planeje seu casamento com elegancia
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="font-heading text-2xl font-semibold text-verde-noite mb-6">
            {isRegister ? "Criar conta" : "Entrar"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-verde-noite/70 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal outline-none transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-verde-noite/70 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal outline-none transition"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-copper text-white rounded-xl font-medium hover:bg-copper/90 transition disabled:opacity-50"
            >
              {loading
                ? "Aguarde..."
                : isRegister
                  ? "Criar conta"
                  : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-teal hover:underline text-sm"
            >
              {isRegister
                ? "Ja tem conta? Entrar"
                : "Nao tem conta? Criar uma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
