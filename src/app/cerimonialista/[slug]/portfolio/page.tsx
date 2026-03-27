"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface PlannerProfile {
  companyName: string;
  bio: string | null;
  instagram: string | null;
  region: string | null;
  specialties: string[];
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

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [planner, setPlanner] = useState<PlannerProfile | null>(null);
  const [weddings, setWeddings] = useState<PortfolioWedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !planner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <p className="font-body text-verde-noite/50">Portfolio nao encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero */}
      <div className="bg-verde-noite text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl mb-3">{planner.companyName}</h1>
          {planner.region && (
            <p className="font-body text-white/60 mb-4">{planner.region}</p>
          )}
          {planner.bio && (
            <p className="font-body text-white/80 max-w-2xl mx-auto leading-relaxed">{planner.bio}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            {planner.instagram && (
              <a
                href={`https://instagram.com/${planner.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-copper hover:text-copper/80 transition"
              >
                @{planner.instagram.replace("@", "")}
              </a>
            )}
            {planner.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {planner.specialties.map((s) => (
                  <span key={s} className="px-3 py-1 bg-white/10 rounded-full font-body text-xs capitalize">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weddings grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-heading text-2xl text-verde-noite text-center mb-10">Casamentos Realizados</h2>

        {weddings.length === 0 ? (
          <p className="font-body text-verde-noite/40 text-center">Nenhum casamento no portfolio ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {weddings.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="h-52 bg-gradient-to-br from-verde-noite to-teal flex items-center justify-center">
                  <span className="font-heading text-5xl text-white/20">
                    {w.partnerName1.charAt(0)}&{w.partnerName2.charAt(0)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl text-verde-noite mb-1">
                    {w.partnerName1} & {w.partnerName2}
                  </h3>
                  {w.weddingDate && (
                    <p className="font-body text-sm text-verde-noite/50">{formatDate(w.weddingDate)}</p>
                  )}
                  {(w.venue || w.city) && (
                    <p className="font-body text-sm text-verde-noite/40 mt-1">
                      {w.venue || ""} {w.city ? `— ${w.city}/${w.state}` : ""}
                    </p>
                  )}
                  {w.style && (
                    <span className="inline-block mt-3 px-3 py-1 bg-cream text-verde-noite/60 text-xs font-body rounded-full capitalize">
                      {w.style}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-100">
        <p className="font-body text-xs text-verde-noite/30">
          Feito com Laco
        </p>
      </div>
    </div>
  );
}
