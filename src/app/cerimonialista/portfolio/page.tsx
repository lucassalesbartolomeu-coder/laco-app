"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface PortfolioWedding {
  id: string;
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

export default function PortfolioPage() {
  const { status: authStatus } = useSession();
  const [weddings, setWeddings] = useState<PortfolioWedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [plannerSlug, setPlannerSlug] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    fetch("/api/planner/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setPlannerSlug(data.planner?.slug || null);
      })
      .catch(console.error);

    fetch("/api/planner/weddings")
      .then((r) => r.json())
      .then((assignments) => {
        const completed = (Array.isArray(assignments) ? assignments : [])
          .filter((a: { status: string }) => a.status === "concluído")
          .map((a: { wedding: PortfolioWedding }) => a.wedding);
        setWeddings(completed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-verde-noite">Meu Portfolio</h1>
          <p className="font-body text-verde-noite/50 mt-1">Casamentos realizados</p>
        </div>
        {plannerSlug && (
          <a
            href={`/cerimonialista/${plannerSlug}/portfolio`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-teal text-teal rounded-xl font-body text-sm hover:bg-teal hover:text-white transition"
          >
            Ver pagina publica
          </a>
        )}
      </div>

      {weddings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="font-body text-verde-noite/40">
            Nenhum casamento concluido ainda. Marque casamentos como &quot;concluido&quot; para aparecerem aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Placeholder image */}
              <div className="h-48 bg-gradient-to-br from-verde-noite to-teal flex items-center justify-center">
                <span className="font-heading text-4xl text-white/20">
                  {w.partnerName1.charAt(0)}&{w.partnerName2.charAt(0)}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg text-verde-noite mb-1">
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
                  <span className="inline-block mt-2 px-2 py-0.5 bg-cream text-verde-noite/60 text-xs font-body rounded-full capitalize">
                    {w.style}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
