"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface InviteInfo {
  weddingId: string;
  couple: string;
  weddingDate: string | null;
  city: string | null;
}

export default function PartnerInvitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weddings/invite/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) setError(data.error);
        else setInvite(data);
      })
      .catch(() => setError("Erro ao carregar convite"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (status !== "authenticated") {
      // Redirect to login with return URL
      router.push(`/login?redirect=/parceiro/${token}`);
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/weddings/invite/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setAccepted(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      setError("Erro ao aceitar convite");
    } finally {
      setAccepting(false);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center"
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <>
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="font-heading text-2xl text-verde-noite mb-2">Convite inválido</h1>
            <p className="font-body text-verde-noite/60 mb-6">{error}</p>
            <Link href="/dashboard" className="font-body text-sm text-teal hover:underline">
              Ir para o painel →
            </Link>
          </>
        ) : accepted ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-5xl mb-4"
            >
              🎉
            </motion.div>
            <h1 className="font-heading text-2xl text-verde-noite mb-2">Vinculado com sucesso!</h1>
            <p className="font-body text-verde-noite/60">Redirecionando para o painel…</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">💍</div>
            <p className="font-body text-sm text-verde-noite/40 mb-1 uppercase tracking-wide">
              Você foi convidado para
            </p>
            <h1 className="font-heading text-3xl text-verde-noite mb-3">
              {invite?.couple}
            </h1>

            {(invite?.weddingDate || invite?.city) && (
              <div className="flex items-center justify-center gap-4 mb-6 text-sm font-body text-verde-noite/60">
                {invite.weddingDate && (
                  <span>📅 {formatDate(invite.weddingDate)}</span>
                )}
                {invite.city && <span>📍 {invite.city}</span>}
              </div>
            )}

            <div className="p-4 bg-cream rounded-xl mb-6 text-left">
              <p className="font-body text-sm text-verde-noite/70">
                Ao aceitar, você terá acesso completo ao painel do casamento — convidados, presentes, orçamentos e tudo mais.
              </p>
            </div>

            {status === "unauthenticated" && (
              <p className="font-body text-xs text-verde-noite/40 mb-4">
                Você precisará entrar ou criar uma conta para aceitar o convite.
              </p>
            )}

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 rounded-xl bg-copper text-white font-body font-medium hover:bg-copper/90 transition disabled:opacity-50"
            >
              {accepting
                ? "Aceitando…"
                : status === "authenticated"
                ? "Aceitar convite"
                : "Entrar para aceitar"}
            </button>

            {status === "authenticated" && (
              <p className="font-body text-xs text-verde-noite/40 mt-3">
                Conectado como {session?.user?.email}
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
