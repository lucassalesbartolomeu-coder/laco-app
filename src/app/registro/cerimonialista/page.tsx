"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SPECIALTIES = [
  "Casamento classico",
  "Destination wedding",
  "Mini wedding",
  "Casamento ao ar livre",
  "Casamento religioso",
  "Casamento civil",
  "Elopement",
  "Casamento tematico",
];

const REGIONS = [
  "SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "DF",
  "GO", "ES", "PA", "MA", "MT", "MS", "AM", "RN", "PB", "AL",
  "SE", "PI", "RO", "AC", "AP", "RR", "TO",
];

export default function RegistroCerimonialista() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Personal
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Professional
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [bio, setBio] = useState("");

  function toggleSpecialty(s: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          role: "PLANNER",
          plannerData: {
            companyName,
            cnpj: cnpj || undefined,
            phone,
            region,
            specialties: selectedSpecialties,
            instagram: instagram || undefined,
            bio: bio || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Auto login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Conta criada, mas houve erro no login. Tente entrar manualmente.");
        setLoading(false);
        return;
      }

      router.push("/cerimonialista/dashboard");
    } catch {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-midnight focus:border-gold focus:ring-1 focus:ring-gold outline-none transition";

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl text-white">Laco</h1>
          <p className="text-white/60 mt-2 font-body">
            Registro Profissional — Cerimonialista
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-sm font-semibold transition-all ${
                  step >= s
                    ? "bg-gold text-white"
                    : "bg-white/20 text-white/50"
                }`}
              >
                {s}
              </div>
              <span className="font-body text-sm text-white/70 hidden sm:inline">
                {s === 1 ? "Dados pessoais" : "Dados profissionais"}
              </span>
              {s === 1 && (
                <div className="w-8 h-0.5 bg-white/20 mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-heading text-2xl text-midnight mb-2">
                Seus dados
              </h2>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim() || !email.trim() || password.length < 6) {
                    setError("Preencha todos os campos obrigatorios");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 bg-midnight text-white rounded-xl font-body font-medium hover:bg-midnight/90 transition"
              >
                Proximo
              </button>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-heading text-2xl text-midnight mb-2">
                Dados profissionais
              </h2>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Nome da empresa *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: Eventos Elegance"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm text-midnight/70 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className={inputClass}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm text-midnight/70 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Regiao de atuacao *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Selecione</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-2">
                  Especialidades
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all ${
                        selectedSpecialties.includes(s)
                          ? "bg-midnight text-white border-midnight"
                          : "bg-white text-midnight/70 border-gray-200 hover:border-midnight"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className={inputClass}
                  placeholder="@seuinstagram"
                />
              </div>

              <div>
                <label className="block font-body text-sm text-midnight/70 mb-1">
                  Bio / Sobre voce
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Conte um pouco sobre sua experiencia..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 text-midnight rounded-xl font-body font-medium hover:bg-gray-50 transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!companyName.trim() || !phone.trim() || !region) {
                      setError("Preencha empresa, telefone e região");
                      return;
                    }
                    handleSubmit();
                  }}
                  disabled={loading}
                  className="flex-1 py-3 bg-gold text-white rounded-xl font-body font-medium hover:bg-gold/90 transition disabled:opacity-50"
                >
                  {loading ? "Criando conta..." : "Criar conta"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/40 text-sm mt-6 font-body">
          Ja tem conta?{" "}
          <a href="/login" className="text-gold hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
