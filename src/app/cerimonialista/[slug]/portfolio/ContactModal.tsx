"use client";

import { useState } from "react";

interface ContactModalProps {
  slug: string;
  companyName: string;
  onClose: () => void;
}

export default function ContactModal({ slug, companyName, onClose }: ContactModalProps) {
  const [form, setForm] = useState({
    coupleName: "",
    contactEmail: "",
    contactPhone: "",
    weddingDate: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/planner/${slug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erro ao enviar");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar orçamento"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-fog rounded-3xl shadow-float overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-midnight px-8 py-6">
          <h2 className="font-heading text-xl text-white">Solicitar Orçamento</h2>
          <p className="font-body text-sm text-white/60 mt-1">
            Entre em contato com {companyName}
          </p>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-5 right-6 text-white/50 hover:text-white transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-midnight/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-heading text-xl text-midnight mb-2">Mensagem enviada!</h3>
            <p className="font-body text-sm text-midnight/60 mb-6">
              {companyName} receberá seu pedido em breve.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-midnight text-white font-body text-sm rounded-xl hover:bg-midnight transition"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="font-body text-xs text-midnight/60 uppercase tracking-wide mb-1 block">
                Nome do casal <span className="text-gold">*</span>
              </label>
              <input
                name="coupleName"
                value={form.coupleName}
                onChange={handleChange}
                required
                placeholder="Ex: Ana & Carlos"
                className="w-full px-4 py-3 rounded-xl bg-white border border-midnight/10 font-body text-sm text-midnight placeholder-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs text-midnight/60 uppercase tracking-wide mb-1 block">
                  E-mail
                </label>
                <input
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-midnight/10 font-body text-sm text-midnight placeholder-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
                />
              </div>
              <div>
                <label className="font-body text-xs text-midnight/60 uppercase tracking-wide mb-1 block">
                  Telefone / WhatsApp
                </label>
                <input
                  name="contactPhone"
                  type="tel"
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="(11) 9 0000-0000"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-midnight/10 font-body text-sm text-midnight placeholder-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs text-midnight/60 uppercase tracking-wide mb-1 block">
                Data prevista do casamento
              </label>
              <input
                name="weddingDate"
                type="date"
                value={form.weddingDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-midnight/10 font-body text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              />
            </div>

            <div>
              <label className="font-body text-xs text-midnight/60 uppercase tracking-wide mb-1 block">
                Mensagem
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Conte um pouco sobre o casamento dos seus sonhos..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-midnight/10 font-body text-sm text-midnight placeholder-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/40 transition resize-none"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-error">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-midnight/20 font-body text-sm text-midnight/60 hover:bg-midnight/5 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl bg-gold text-white font-body text-sm font-semibold hover:bg-gold/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Enviando..." : "Enviar pedido"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
