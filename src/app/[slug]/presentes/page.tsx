"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ShareWhatsApp from "@/components/share-whatsapp";

interface Wedding {
  id: string;
  slug: string;
  partnerName1: string;
  partnerName2: string;
}

interface Gift {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  url: string | null;
  store: string | null;
  status: string;
  reservedBy: string | null;
}

export default function PresentesPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [reservedBy, setReservedBy] = useState("");
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");

  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      try {
        const [weddingRes, giftsRes] = await Promise.all([
          fetch(`/api/public/wedding/${slug}`),
          fetch(`/api/public/wedding/${slug}/gifts`),
        ]);

        if (!weddingRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const weddingData = await weddingRes.json();
        const giftsData = giftsRes.ok ? await giftsRes.json() : [];

        setWedding(weddingData);
        setGifts(giftsData);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  function formatPrice(price: number | null) {
    if (price == null) return null;
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function openReserveModal(giftId: string) {
    setSelectedGiftId(giftId);
    setReservedBy("");
    setReserveError("");
    setModalOpen(true);
  }

  async function handleReserve() {
    if (!reservedBy.trim()) {
      setReserveError("Por favor, informe seu nome.");
      return;
    }

    setReserving(true);
    setReserveError("");

    try {
      const res = await fetch(`/api/public/wedding/${slug}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: selectedGiftId, reservedBy: reservedBy.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setReserveError(data.error || "Erro ao reservar presente.");
        setReserving(false);
        return;
      }

      // Update gift in local state
      setGifts((prev) =>
        prev.map((g) =>
          g.id === selectedGiftId
            ? { ...g, status: "reserved", reservedBy: reservedBy.trim() }
            : g
        )
      );

      setModalOpen(false);
    } catch {
      setReserveError("Erro de conexao. Tente novamente.");
    } finally {
      setReserving(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse font-heading text-2xl text-midnight/50">
          Carregando...
        </div>
      </div>
    );
  }

  // ── 404 ──
  if (notFound || !wedding) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-4">
        <h1 className="font-heading text-3xl text-midnight">
          Casamento nao encontrado
        </h1>
        <p className="font-body text-midnight/60">
          O link pode estar incorreto ou o casamento foi removido.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 font-body text-midnight underline hover:text-midnight transition-colors"
        >
          Voltar ao inicio
        </button>
      </div>
    );
  }

  const partnerNames = `${wedding.partnerName1} & ${wedding.partnerName2}`;

  return (
    <div className="min-h-screen bg-ivory">
      {/* ── Header ── */}
      <header className="bg-midnight text-white py-12 px-4 text-center">
        <h1 className="font-heading text-4xl md:text-5xl mb-2">{partnerNames}</h1>
        <p className="font-body text-lg text-white/80">Lista de Presentes</p>
      </header>

      {/* ── Compartilhar ── */}
      <div className="flex justify-center py-5 px-4 bg-ivory border-b border-gray-100">
        <ShareWhatsApp
          message={`Veja nossa lista de presentes: laco.app/${slug}/presentes`}
        />
      </div>

      {/* ── Content ── */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1 font-body text-midnight hover:text-midnight transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>

        {gifts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-midnight/50 text-lg">
              Nenhum presente cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => {
              const isReserved = gift.status === "reserved";

              return (
                <div
                  key={gift.id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-opacity ${
                    isReserved ? "opacity-60" : ""
                  }`}
                >
                  {/* Placeholder image area */}
                  <div className="bg-gray-100 h-40 flex items-center justify-center">
                    <span className="text-5xl select-none" role="img" aria-label="presente">
                      🎁
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading text-lg text-midnight mb-1">
                      {gift.name}
                    </h3>

                    {gift.description && (
                      <p className="font-body text-sm text-midnight/60 mb-2 line-clamp-2">
                        {gift.description}
                      </p>
                    )}

                    {gift.price != null && (
                      <p className="font-body text-midnight font-semibold text-lg mb-3">
                        {formatPrice(gift.price)}
                      </p>
                    )}

                    {gift.store && (
                      <p className="font-body text-xs text-midnight/40 mb-3">
                        {gift.store}
                      </p>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Status / Actions */}
                    {isReserved ? (
                      <div className="bg-gray-100 rounded-lg py-2 px-3 text-center">
                        <span className="font-body text-sm text-midnight/60">
                          Reservado por{" "}
                          <span className="font-semibold">{gift.reservedBy}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {gift.url && (
                          <a
                            href={gift.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center font-body text-sm font-medium py-2.5 px-4 rounded-lg bg-midnight text-white hover:bg-midnight transition-colors"
                          >
                            Quero presentear
                          </a>
                        )}
                        <button
                          onClick={() => openReserveModal(gift.id)}
                          className="w-full font-body text-sm font-medium py-2.5 px-4 rounded-lg border-2 border-gold text-gold hover:bg-gold hover:text-white transition-colors"
                        >
                          Ja comprei
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Reserve Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-xl text-midnight mb-1">
              Confirmar compra
            </h2>
            <p className="font-body text-sm text-midnight/60 mb-5">
              Informe seu nome para que os noivos saibam quem presenteou.
            </p>

            <label className="block font-body text-sm text-midnight mb-1.5">
              Seu nome
            </label>
            <input
              type="text"
              value={reservedBy}
              onChange={(e) => setReservedBy(e.target.value)}
              placeholder="Ex: Maria Silva"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-body text-sm text-midnight placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-midnight/40 focus:border-midnight mb-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReserve();
              }}
            />

            {reserveError && (
              <p className="font-body text-sm text-red-600 mt-1">{reserveError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 font-body text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-300 text-midnight/70 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="flex-1 font-body text-sm font-medium py-2.5 px-4 rounded-lg bg-gold text-white hover:bg-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {reserving ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
