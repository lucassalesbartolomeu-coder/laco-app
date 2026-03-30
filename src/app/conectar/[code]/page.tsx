"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface WeddingPreview {
  partner1: string;
  partner2: string;
  date: string | null;
  city: string | null;
}

export default function ConectarPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const { status: authStatus } = useSession();

  const [preview, setPreview] = useState<WeddingPreview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState("");

  // Load preview (public route, no auth needed)
  useEffect(() => {
    fetch(`/api/invite/${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) setPreview(d.wedding);
        else setPreviewError(d.error || "Código inválido ou expirado");
      })
      .catch(() => setPreviewError("Erro ao carregar convite"));
  }, [code]);

  // If not logged in, redirect to login with callback
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/conectar/${code}`)}`);
    }
  }, [authStatus, code, router]);

  async function handleAccept() {
    setAccepting(true);
    setAcceptError("");
    try {
      const res = await fetch("/api/cerimonialista/aceitar-convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const d = await res.json();
      if (!res.ok) {
        setAcceptError(d.error || "Erro ao aceitar convite");
      } else {
        setAccepted(true);
        setTimeout(() => router.push("/cerimonialista/dashboard"), 2000);
      }
    } catch {
      setAcceptError("Erro de conexão");
    } finally {
      setAccepting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }

  // Loading
  if (authStatus === "loading" || authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-heading text-3xl text-midnight">Laço</span>
        </div>

        {/* Error state */}
        {previewError && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-4xl mb-4">🔗</p>
            <p className="font-heading text-xl text-midnight mb-2">Convite inválido</p>
            <p className="font-body text-sm text-midnight/50 mb-6">{previewError}</p>
            <Link
              href="/cerimonialista/dashboard"
              className="inline-block px-6 py-2.5 bg-midnight text-white rounded-xl font-body text-sm font-medium hover:bg-midnight/90 transition"
            >
              Ir para o painel
            </Link>
          </div>
        )}

        {/* Accepted state */}
        {accepted && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-midnight/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-heading text-2xl text-midnight mb-1">Vinculada! 🎉</p>
            {preview && (
              <p className="font-body text-sm text-midnight/60">
                Você está conectada a {preview.partner1} & {preview.partner2}
              </p>
            )}
            <p className="font-body text-xs text-midnight/30 mt-4">Redirecionando para o painel...</p>
          </div>
        )}

        {/* Preview + accept */}
        {!previewError && !accepted && preview && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="font-body text-xs text-midnight uppercase tracking-widest mb-4 text-center">
              Convite de casamento
            </p>

            {/* Couple card */}
            <div className="bg-midnight/5 border border-midnight/10 rounded-2xl p-5 text-center mb-6">
              <p className="text-3xl mb-3">💍</p>
              <p className="font-heading text-2xl text-midnight leading-tight">
                {preview.partner1} & {preview.partner2}
              </p>
              {preview.date && (
                <p className="font-body text-sm text-midnight/50 mt-1">{formatDate(preview.date)}</p>
              )}
              {preview.city && (
                <p className="font-body text-xs text-midnight/40 mt-0.5">📍 {preview.city}</p>
              )}
            </div>

            <p className="font-body text-sm text-midnight/60 text-center mb-5">
              Aceite o convite para se vincular como cerimonialista deste casamento.
            </p>

            {acceptError && (
              <p className="font-body text-sm text-red-500 text-center mb-4">{acceptError}</p>
            )}

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-midnight text-white rounded-xl font-body text-sm font-medium hover:bg-midnight/90 transition disabled:opacity-50"
            >
              {accepting ? "Aceitando..." : "Aceitar convite"}
            </button>

            <Link
              href="/cerimonialista/dashboard"
              className="block text-center font-body text-xs text-midnight/40 hover:text-midnight/60 mt-3 transition"
            >
              Recusar e ir para o painel
            </Link>
          </div>
        )}

        {/* Loading preview */}
        {!previewError && !accepted && !preview && (
          <div className="bg-white rounded-2xl shadow-sm p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
          </div>
        )}

      </div>
    </div>
  );
}
