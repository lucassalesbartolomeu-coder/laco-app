"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ContactModal from "./ContactModal";
import type { PlannerProfile, PortfolioWedding } from "./page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function WeddingCardVisual({
  name1,
  name2,
  coverImage,
}: {
  name1: string;
  name2: string;
  coverImage: string | null;
}) {
  if (coverImage) {
    return (
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={`${name1} & ${name2}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-verde-noite/50 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="h-52 bg-gradient-to-br from-verde-noite via-teal to-verde-noite/80 flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 75%, #C4734F 0%, transparent 55%), radial-gradient(circle at 75% 20%, #2C6B5E 0%, transparent 50%)",
        }}
      />
      <span className="font-heading text-7xl text-white/25 select-none tracking-widest">
        {name1.charAt(0)}&amp;{name2.charAt(0)}
      </span>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl">
      <span className="text-copper shrink-0">{icon}</span>
      <span className="font-body text-sm text-white/90 leading-tight">
        <span className="font-semibold text-white">{value}</span>{" "}
        <span className="text-white/70">{label}</span>
      </span>
    </div>
  );
}

// ─── Ícones inline ────────────────────────────────────────────────────────────

const IconHeart = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const IconClock = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconPin = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconCalendar = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconLocation = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconInstagram = (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const IconGlobe = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);

const IconCheck = (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PortfolioClient({ slug }: { slug: string }) {
  const [planner, setPlanner] = useState<PlannerProfile | null>(null);
  const [weddings, setWeddings] = useState<PortfolioWedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/public/planner/${slug}/portfolio`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: { planner: PlannerProfile; weddings: PortfolioWedding[] }) => {
        setPlanner(data.planner);
        setWeddings(data.weddings);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-verde-noite/40">Carregando portfólio...</p>
        </div>
      </div>
    );
  }

  // ── Erro ─────────────────────────────────────────────────────────────────────
  if (fetchError || !planner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
        <div className="w-16 h-16 rounded-full bg-verde-noite/5 flex items-center justify-center">
          <svg className="w-8 h-8 text-verde-noite/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-body text-verde-noite/40">Portfólio não encontrado.</p>
      </div>
    );
  }

  const city = planner.region ?? "";

  return (
    <div className="min-h-screen bg-cream">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO FULL-WIDTH
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[520px] flex flex-col">

        {/* Fundo: foto de capa ou gradiente */}
        {planner.heroCoverImage ? (
          <div className="absolute inset-0">
            <Image
              src={planner.heroCoverImage}
              alt={planner.companyName}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Camada escura sobre a foto */}
            <div className="absolute inset-0 bg-gradient-to-b from-verde-noite/70 via-verde-noite/55 to-verde-noite/90" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-verde-noite">
            {/* Gradiente decorativo */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 15% 85%, #C4734F 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, #2C6B5E 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #1A3A33 0%, transparent 80%)",
              }}
            />
            {/* Padrão sutil de bolinhas */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        )}

        {/* Conteúdo do hero */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-8 max-w-3xl mx-auto w-full">

          {/* Avatar circular */}
          <div className="mb-6">
            {planner.avatarUrl ? (
              <div className="relative w-28 h-28 rounded-full ring-4 ring-white/20 shadow-float overflow-hidden mx-auto">
                <Image
                  src={planner.avatarUrl}
                  alt={planner.companyName}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal to-copper flex items-center justify-center ring-4 ring-white/20 shadow-float mx-auto">
                <span className="font-heading text-5xl text-white select-none">
                  {planner.companyName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Nome + badge verificado */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight">
              {planner.companyName}
            </h1>
            {planner.isVerified && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal/90 backdrop-blur-sm text-white rounded-full shrink-0 shadow-sm">
                {IconCheck}
                <span className="font-body text-xs font-semibold tracking-wide">
                  Verificado pelo Laço
                </span>
              </div>
            )}
          </div>

          {/* Subtítulo / especialidade */}
          <p className="font-body text-sm text-white/60 tracking-widest uppercase mb-6 select-none">
            Cerimonialista
            {city ? ` · ${city}` : ""}
          </p>

          {/* Links sociais */}
          {(planner.instagram || planner.website) && (
            <div className="flex items-center gap-3 mb-8">
              {planner.instagram && (
                <a
                  href={`https://instagram.com/${planner.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 font-body text-sm text-white/80 hover:bg-white/20 transition"
                >
                  {IconInstagram}
                  <span>@{planner.instagram.replace("@", "")}</span>
                </a>
              )}
              {planner.website && (
                <a
                  href={planner.website.startsWith("http") ? planner.website : `https://${planner.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 font-body text-sm text-white/80 hover:bg-white/20 transition"
                >
                  {IconGlobe}
                  <span>Website</span>
                </a>
              )}
            </div>
          )}

          {/* CTA hero */}
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3.5 bg-copper text-white font-body text-sm font-semibold rounded-2xl shadow-float hover:bg-copper/90 active:scale-95 transition"
          >
            Solicitar Orçamento
          </button>
        </div>

        {/* ── Stats pills ──────────────────────────────────────────────────────── */}
        <div className="relative px-6 pb-8">
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-3">
            <StatPill
              icon={IconHeart}
              value={planner.weddingCount}
              label={planner.weddingCount === 1 ? "casamento realizado" : "casamentos realizados"}
            />
            {planner.yearsExperience > 0 && (
              <StatPill
                icon={IconClock}
                value={planner.yearsExperience}
                label={planner.yearsExperience === 1 ? "ano de experiência" : "anos de experiência"}
              />
            )}
            {city && (
              <StatPill icon={IconPin} value={city} label="" />
            )}
          </div>
        </div>

        {/* Divisória ondulada */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 block">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#FFF8F0" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BIO / DESCRIÇÃO
      ══════════════════════════════════════════════════════════════════════ */}
      {(planner.bio || planner.specialties.length > 0) && (
        <section className="max-w-2xl mx-auto px-6 pt-12 pb-10 text-center">
          {planner.bio && (
            <p className="font-body text-base md:text-lg text-verde-noite/75 leading-relaxed">
              {planner.bio}
            </p>
          )}

          {planner.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {planner.specialties.map((s) => (
                <span
                  key={s}
                  className="px-4 py-1.5 bg-teal/8 border border-teal/20 text-teal rounded-full font-body text-xs font-medium capitalize tracking-wide"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          GALERIA DE CASAMENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl text-verde-noite mb-2">
            Casamentos Realizados
          </h2>
          <p className="font-body text-sm text-verde-noite/40">
            Cada história é única e merece ser celebrada.
          </p>
          {/* Linha decorativa */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-copper/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-copper/50" />
            <div className="h-px w-16 bg-copper/30" />
          </div>
        </div>

        {weddings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-verde-noite/5">
            <div className="w-16 h-16 rounded-full bg-verde-noite/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-verde-noite/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="font-body text-sm text-verde-noite/30">
              Nenhum casamento no portfólio ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {weddings.map((w, i) => (
              <article
                key={i}
                className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-verde-noite/5"
              >
                <WeddingCardVisual
                  name1={w.partnerName1}
                  name2={w.partnerName2}
                  coverImage={w.coverImage}
                />

                <div className="p-6">
                  {/* Nomes */}
                  <h3 className="font-heading text-xl md:text-2xl text-verde-noite group-hover:text-teal transition-colors mb-3">
                    {w.partnerName1} &amp; {w.partnerName2}
                  </h3>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3">
                    {w.weddingDate && (
                      <span className="flex items-center gap-1.5 font-body text-xs text-verde-noite/50">
                        {IconCalendar}
                        <span className="capitalize">{formatDate(w.weddingDate)}</span>
                      </span>
                    )}
                    {(w.venue || w.city) && (
                      <span className="flex items-center gap-1.5 font-body text-xs text-verde-noite/50">
                        {IconLocation}
                        <span className="truncate max-w-[200px]">
                          {[w.venue, w.city && w.state ? `${w.city}/${w.state}` : w.city]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Estilo */}
                  {w.style && (
                    <span className="inline-block mt-4 px-3 py-1 bg-cream text-verde-noite/55 text-xs font-body rounded-full capitalize border border-verde-noite/8 tracking-wide">
                      {w.style}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SEÇÃO CTA FINAL
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-verde-noite py-20 px-6 mt-8">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 80%, #C4734F 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #2C6B5E 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-xl mx-auto text-center">
          <p className="font-body text-xs text-copper/80 tracking-widest uppercase mb-3">
            Vamos começar
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
            Pronto para o dia mais especial da sua vida?
          </h2>
          <p className="font-body text-sm text-white/55 mb-8 leading-relaxed">
            {planner.companyName} está pronto para transformar o seu sonho em uma celebração inesquecível.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-10 py-4 bg-copper text-white font-body text-sm font-semibold rounded-2xl hover:bg-copper/90 active:scale-95 transition shadow-float"
          >
            Solicitar Orçamento
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="text-center py-8 bg-cream border-t border-verde-noite/6">
        <p className="font-body text-xs text-verde-noite/25 tracking-wide">
          Portfólio hospedado no{" "}
          <a
            href="https://laco.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-verde-noite/40 hover:text-teal transition"
          >
            Laço
          </a>
        </p>
      </footer>

      {/* ── Botão CTA fixo no mobile ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-cream/95 backdrop-blur-md border-t border-verde-noite/10 px-4 py-3 pb-safe">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3.5 bg-copper text-white font-body text-sm font-semibold rounded-2xl shadow-float hover:bg-copper/90 active:scale-98 transition"
          >
            Solicitar Orçamento
          </button>
        </div>
      </div>

      {/* ── Modal de contato ─────────────────────────────────────────────── */}
      {modalOpen && (
        <ContactModal
          slug={slug}
          companyName={planner.companyName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
