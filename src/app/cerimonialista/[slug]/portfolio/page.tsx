"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import ContactModal from "./ContactModal";

interface PlannerProfile {
  companyName: string;
  bio: string | null;
  instagram: string | null;
  region: string | null;
  specialties: string[];
  isVerified: boolean;
  weddingCount: number;
  yearsExperience: number;
}

interface PortfolioWedding {
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  style: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function WeddingInitials({ name1, name2 }: { name1: string; name2: string }) {
  return (
    <div className="h-56 bg-gradient-to-br from-verde-noite via-teal to-verde-noite/80 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #C4734F 0%, transparent 60%), radial-gradient(circle at 80% 20%, #2C6B5E 0%, transparent 50%)" }}
      />
      <span className="font-logo text-6xl text-white/30 select-none tracking-widest">
        {name1.charAt(0)}&{name2.charAt(0)}
      </span>
    </div>
  );
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
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
      .then((data) => {
        setPlanner(data.planner);
        setWeddings(data.weddings);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError || !planner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <p className="font-body text-verde-noite/50">Portfolio não encontrado.</p>
      </div>
    );
  }

  const city = planner.region ?? "";

  return (
    <>
      <Head>
        <title>{`${planner.companyName}${city ? ` · ${city}` : ""} — Cerimonialista | Laço`}</title>
        <meta
          name="description"
          content={
            planner.bio ??
            `Conheça o portfolio de ${planner.companyName}${city ? `, cerimonialista em ${city}` : ""}. ${planner.weddingCount} casamentos realizados.`
          }
        />
        <meta property="og:title" content={`${planner.companyName} — Cerimonialista`} />
        <meta
          property="og:description"
          content={`${planner.weddingCount} casamentos realizados${city ? ` · ${city}` : ""}`}
        />
      </Head>

      <div className="min-h-screen bg-cream" style={{ fontFamily: "inherit" }}>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="relative bg-verde-noite overflow-hidden">
          {/* Subtle texture layer */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, #C4734F 0%, transparent 50%), radial-gradient(circle at 80% 10%, #2C6B5E 0%, transparent 55%)",
            }}
          />

          <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12">
            {/* Avatar ring */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal to-copper flex items-center justify-center mb-5 ring-4 ring-white/10 shadow-float">
                <span className="font-logo text-4xl text-white select-none">
                  {planner.companyName.charAt(0)}
                </span>
              </div>

              {/* Verified badge */}
              {planner.isVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-teal/20 border border-teal/30 rounded-full mb-4">
                  <svg className="w-3.5 h-3.5 text-teal" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-body text-xs text-teal font-medium tracking-wide">
                    Verificado pelo Laço
                  </span>
                </div>
              )}

              <h1 className="font-heading text-3xl md:text-5xl text-white mb-2">
                {planner.companyName}
              </h1>

              {planner.bio && (
                <p className="font-body text-white/70 max-w-xl leading-relaxed text-sm md:text-base mt-2">
                  {planner.bio}
                </p>
              )}

              {planner.instagram && (
                <a
                  href={`https://instagram.com/${planner.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 font-body text-sm text-copper hover:text-copper/80 transition"
                >
                  @{planner.instagram.replace("@", "")}
                </a>
              )}

              {/* Specialties */}
              {planner.specialties.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {planner.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-white/10 border border-white/10 rounded-full font-body text-xs text-white/70 capitalize"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-white/10">
            <div className="max-w-4xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-copper shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-body text-sm text-white/80">
                  <span className="font-semibold text-white">{planner.weddingCount}</span>{" "}
                  casamento{planner.weddingCount !== 1 ? "s" : ""} realizados
                </span>
              </div>

              <div className="w-px h-4 bg-white/15 hidden md:block" />

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-copper shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-body text-sm text-white/80">
                  <span className="font-semibold text-white">{planner.yearsExperience}</span>{" "}
                  {planner.yearsExperience === 1 ? "ano" : "anos"} de experiência
                </span>
              </div>

              {city && (
                <>
                  <div className="w-px h-4 bg-white/15 hidden md:block" />
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-copper shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-body text-sm text-white/80">{city}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── CTA band ───────────────────────────────────────────────────── */}
        <div className="bg-copper/10 border-y border-copper/20 py-5 px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-verde-noite/80 text-center sm:text-left">
              Quer tornar o seu casamento inesquecível?
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-7 py-3 bg-copper text-white font-body text-sm font-semibold rounded-xl shadow-card hover:bg-copper/90 active:scale-95 transition whitespace-nowrap"
            >
              Solicitar orçamento
            </button>
          </div>
        </div>

        {/* ── Wedding gallery ────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="font-heading text-2xl md:text-3xl text-verde-noite text-center mb-2">
            Casamentos Realizados
          </h2>
          <p className="font-body text-sm text-verde-noite/40 text-center mb-10">
            Cada história, única.
          </p>

          {weddings.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-body text-verde-noite/30 text-sm">
                Nenhum casamento no portfolio ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddings.map((w, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden group"
                >
                  <WeddingInitials name1={w.partnerName1} name2={w.partnerName2} />

                  <div className="p-5">
                    <h3 className="font-heading text-lg text-verde-noite group-hover:text-teal transition-colors">
                      {w.partnerName1} &amp; {w.partnerName2}
                    </h3>

                    {w.weddingDate && (
                      <p className="font-body text-xs text-verde-noite/45 mt-1 capitalize">
                        {formatDate(w.weddingDate)}
                      </p>
                    )}

                    {(w.venue || w.city) && (
                      <p className="font-body text-xs text-verde-noite/40 mt-0.5 truncate">
                        {[w.venue, w.city && w.state ? `${w.city}/${w.state}` : w.city]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    {w.style && (
                      <span className="inline-block mt-3 px-3 py-1 bg-cream text-verde-noite/60 text-xs font-body rounded-full capitalize border border-verde-noite/8">
                        {w.style}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
        <div className="bg-verde-noite py-14 px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="font-heading text-2xl text-white mb-2">
              Vamos planejar o seu dia?
            </p>
            <p className="font-body text-sm text-white/60 mb-6">
              {planner.companyName} está pronto para tornar o seu casamento inesquecível.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-3.5 bg-copper text-white font-body text-sm font-semibold rounded-xl hover:bg-copper/90 active:scale-95 transition shadow-float"
            >
              Solicitar orçamento
            </button>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="text-center py-6 bg-cream border-t border-verde-noite/8">
          <p className="font-body text-xs text-verde-noite/30">
            Feito com Laço
          </p>
        </div>
      </div>

      {/* Contact modal */}
      {modalOpen && (
        <ContactModal
          slug={slug}
          companyName={planner.companyName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
