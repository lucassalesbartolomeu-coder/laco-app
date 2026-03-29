"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

type LinkStatus = "loading" | "none" | "pendente" | "ativo";

interface PlannerInfo {
  companyName: string;
  slug: string;
}

export default function CerimonialstaPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status: authStatus } = useSession();
  const toast = useToast();

  const [linkStatus, setLinkStatus] = useState<LinkStatus>("loading");
  const [planner, setPlanner] = useState<PlannerInfo | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch(`/api/weddings/${weddingId}/planner`)
      .then((r) => r.json())
      .then((d) => {
        setLinkStatus(d.status === "none" ? "none" : d.status);
        if (d.planner) setPlanner(d.planner);
      })
      .catch(() => setLinkStatus("none"));
  }, [authStatus, weddingId]);

  async function handleInvite() {
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", plannerEmail: email.trim() }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error || "Erro ao enviar solicitacao.");
      } else {
        setLinkStatus("pendente");
        if (d.planner) setPlanner(d.planner);
        track("planner_linked", { weddingId });
        toast.success("Solicitacao enviada!");
      }
    } catch {
      toast.error("Erro de conexao.");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Desvincular a cerimonialista deste casamento?")) return;
    setRemoving(true);
    try {
      await fetch(`/api/weddings/${weddingId}/planner`, { method: "DELETE" });
      setLinkStatus("none");
      setPlanner(null);
      setEmail("");
    } catch {
      toast.error("Erro ao desvincular.");
    } finally {
      setRemoving(false);
    }
  }

  if (authStatus === "loading" || linkStatus === "loading") {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-verde-noite to-verde-noite/90 px-5 pt-12 pb-10">
        <span className="font-body text-xs text-white/50 uppercase tracking-wider">Sua equipe</span>
        <h1 className="font-heading text-3xl text-white mt-1 mb-2">Cerimonialista</h1>
        <p className="font-body text-sm text-white/65 max-w-md">
          Conecte sua cerimonialista ao casamento para que ela acompanhe lista de convidados, fornecedores e timeline.
        </p>
      </div>

      <div className="px-4 mt-6 space-y-5">

        {/* ── Nenhum vínculo ─────────────────────────────────────── */}
        {linkStatus === "none" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading text-lg text-verde-noite mb-1">Convidar cerimonialista</h2>
            <p className="font-body text-sm text-gray-400 mb-5">
              Informe o e-mail que a cerimonialista usa para acessar o Laco. Ela receberá uma solicitação de vínculo para aprovar.
            </p>

            <label className="font-body text-xs text-verde-noite/60 uppercase tracking-wider mb-1.5 block">
              E-mail da cerimonialista
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              placeholder="cerimonialista@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl font-body text-sm text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition mb-4"
            />

            <button
              onClick={handleInvite}
              disabled={sending || !email.trim()}
              className="w-full py-3 bg-teal text-white rounded-xl font-body text-sm font-medium hover:bg-teal/90 transition disabled:opacity-40"
            >
              {sending ? "Enviando..." : "Enviar solicitacao"}
            </button>

            <p className="font-body text-[11px] text-gray-400 mt-3 text-center">
              A cerimonialista precisa ter uma conta no Laco para ser vinculada.
            </p>
          </div>
        )}

        {/* ── Aguardando aprovação ───────────────────────────────── */}
        {linkStatus === "pendente" && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-heading text-base text-verde-noite">Aguardando aprovacao</p>
                {planner && (
                  <p className="font-body text-sm text-gray-400">{planner.companyName}</p>
                )}
              </div>
            </div>

            <p className="font-body text-sm text-gray-500 mb-5">
              Sua solicitacao foi enviada. Assim que a cerimonialista aprovar o vínculo, ela terá acesso ao seu painel de casamento.
            </p>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-full py-2.5 border border-red-200 text-red-400 rounded-xl font-body text-sm hover:bg-red-50 transition disabled:opacity-40"
            >
              {removing ? "Cancelando..." : "Cancelar solicitacao"}
            </button>
          </div>
        )}

        {/* ── Vínculo ativo ─────────────────────────────────────── */}
        {linkStatus === "ativo" && planner && (
          <div className="bg-white rounded-2xl shadow-sm border border-teal/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-heading text-base text-verde-noite">Vinculo ativo</p>
                <p className="font-body text-sm text-gray-400">{planner.companyName}</p>
              </div>
            </div>

            <p className="font-body text-sm text-gray-500 mb-5">
              A cerimonialista ja tem acesso ao painel do seu casamento e pode acompanhar tudo em tempo real.
            </p>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-full py-2.5 border border-red-200 text-red-400 rounded-xl font-body text-sm hover:bg-red-50 transition disabled:opacity-40"
            >
              {removing ? "Desvinculando..." : "Desvincular cerimonialista"}
            </button>
          </div>
        )}

        {/* Info card */}
        <div className="bg-teal/5 border border-teal/10 rounded-2xl p-4">
          <p className="font-body text-xs text-teal/80">
            <strong>Como funciona:</strong> Sua cerimonialista recebe a solicitacao no painel dela e aprova o vinculo. Apos aprovacao, ela acompanha lista de convidados, fornecedores e timeline em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
