"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Wedding {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  style: string | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/weddings")
        .then((r) => r.json())
        .then((data) => {
          setWeddings(data);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="animate-pulse font-heading text-2xl text-verde-noite/50">
          Carregando...
        </div>
      </div>
    );
  }

  const formatDate = (d: string | null) => {
    if (!d) return "A definir";
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (v: number | null) => {
    if (!v) return "A definir";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);
  };

  return (
    <div className="min-h-screen bg-off-white">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-semibold text-verde-noite">
            Laco
          </h1>
          <span className="text-sm text-verde-noite/60">
            {session?.user?.email}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl font-semibold text-verde-noite">
            Meus Casamentos
          </h2>
          <Link
            href="/casamento/novo"
            className="px-6 py-3 bg-copper text-white rounded-xl font-medium hover:bg-copper/90 transition"
          >
            + Novo Casamento
          </Link>
        </div>

        {weddings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">&#128141;</div>
            <h3 className="font-heading text-2xl font-semibold text-verde-noite mb-2">
              Nenhum casamento ainda
            </h3>
            <p className="text-verde-noite/60 mb-6">
              Comece criando seu primeiro casamento e organize tudo em um so
              lugar.
            </p>
            <Link
              href="/casamento/novo"
              className="inline-block px-8 py-3 bg-copper text-white rounded-xl font-medium hover:bg-copper/90 transition"
            >
              Criar meu casamento
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {weddings.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-2xl font-semibold text-verde-noite">
                      {w.partnerName1} &amp; {w.partnerName2}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-verde-noite/60">
                      {w.weddingDate && (
                        <span>&#128197; {formatDate(w.weddingDate)}</span>
                      )}
                      {w.city && (
                        <span>
                          &#128205; {w.city}
                          {w.state ? `, ${w.state}` : ""}
                        </span>
                      )}
                      {w.style && <span>&#10024; {w.style}</span>}
                      {w.estimatedGuests && (
                        <span>&#128101; {w.estimatedGuests} convidados</span>
                      )}
                      {w.estimatedBudget && (
                        <span>
                          &#128176; {formatCurrency(w.estimatedBudget)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/casamento/${w.id}/convidados`}
                      className="px-4 py-2 text-sm border border-teal text-teal rounded-xl hover:bg-teal/5 transition"
                    >
                      Convidados
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/importar`}
                      className="px-4 py-2 text-sm border border-teal text-teal rounded-xl hover:bg-teal/5 transition"
                    >
                      Importar
                    </Link>
                    <Link
                      href={`/casamento/${w.id}/simulador`}
                      className="px-4 py-2 text-sm bg-copper text-white rounded-xl hover:bg-copper/90 transition"
                    >
                      Simulador
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
