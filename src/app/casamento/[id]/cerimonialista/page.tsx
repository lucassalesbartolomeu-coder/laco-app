"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

type LinkStatus = "loading" | "none" | "pendente" | "ativo";

interface PlannerInfo {
  companyName: string;
  slug: string;
}

interface InviteCodeData {
  code: string;
  expiresAt: string;
}

export default function CerimonialstaPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status: authStatus } = useSession();
  const toast = useToast();

  const [linkStatus, setLinkStatus] = useState<LinkStatus>("loading");
  const [planner, setPlanner] = useState<PlannerInfo | null>(null);
  const [removing, setRemoving] = useState(false);

  const [inviteCode, setInviteCode] = useState<InviteCodeData | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    Promise.all([
      fetch(`/api/weddings/${weddingId}/planner`).then((r) => r.json()),
      fetch(`/api/weddings/${weddingId}/invite-code`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([plannerData, codeData]) => {
        setLinkStatus(plannerData.status === "none" ? "none" : plannerData.status);
        if (plannerData.planner) setPlanner(plannerData.planner);
        if (codeData?.code) setInviteCode({ code: codeData.code, expiresAt: codeData.expiresAt });
      })
      .catch(() => setLinkStatus("none"));
  }, [authStatus, weddingId]);

  async function handleGenerateCode() {
    setGeneratingCode(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/invite-code`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error || "Erro ao gerar código.");
      } else {
        setInviteCode({ code: d.code, expiresAt: d.expiresAt });
        track("planner_invite_code_generated", { weddingId });
        toast.success("Código gerado!");
      }
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Desvincular a cerimonialista deste casamento?")) return;
    setRemoving(true);
    try {
      await fetch(`/api/weddings/${weddingId}/planner`, { method: "DELETE" });
      setLinkStatus("none");
      setPlanner(null);
      setInviteCode(null);
    } catch {
      toast.error("Erro ao desvincular.");
    } finally {
      setRemoving(false);
    }
  }

  function formatExpiry(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getWhatsAppLink(code: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://laco.com.vc";
    const text = encodeURIComponent(
      `Olá! Você foi convidada para gerenciar nosso casamento no Laço.\n\nAcesse ${appUrl}/conectar/${code} e use o código: *${code}*\n\nO código expira em 72 horas.`
    );
    return `https://wa.me/?text=${text}`;
  }

  if (authStatus === "loading" || linkStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BROWN, borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* Light header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Assessoria
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Cerimonialista
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Vincule sua assessora e acompanhe o planejamento juntos.
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-4 space-y-5">

        {/* Sem código ainda */}
        {linkStatus === "none" && !inviteCode && (
          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
            <h2 className="font-heading text-lg mb-1" style={{ color: BROWN }}>Convidar cerimonialista</h2>
            <p className="font-body text-sm mb-5" style={{ color: "rgba(61,50,42,0.50)" }}>
              Gere um código único e compartilhe com sua cerimonialista. Ela usará o código para se vincular ao seu casamento diretamente.
            </p>

            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="w-full py-3 rounded-2xl font-body text-sm font-medium transition disabled:opacity-40"
              style={{ background: BROWN, color: CREME }}
            >
              {generatingCode ? "Gerando..." : "Gerar código de convite"}
            </button>

            <p className="font-body text-[11px] mt-3 text-center" style={{ color: "rgba(61,50,42,0.40)" }}>
              O código é válido por 72 horas e pode ser compartilhado via WhatsApp.
            </p>
          </div>
        )}

        {/* Código gerado */}
        {linkStatus === "none" && inviteCode && (
          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid rgba(169,137,80,0.20)" }}>
            <h2 className="font-heading text-lg mb-1" style={{ color: BROWN }}>Código de convite</h2>
            <p className="font-body text-sm mb-5" style={{ color: "rgba(61,50,42,0.50)" }}>
              Compartilhe este código com sua cerimonialista. Válido até {formatExpiry(inviteCode.expiresAt)}.
            </p>

            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-2xl px-6 py-4 flex-1 text-center" style={{ background: "rgba(169,137,80,0.07)" }}>
                <p className="font-display text-4xl tracking-[0.35em] font-bold select-all" style={{ color: BROWN }}>
                  {inviteCode.code}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode.code);
                  toast.success("Código copiado!");
                }}
                className="p-3 rounded-2xl hover:opacity-80 transition shrink-0"
                style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}
                aria-label="Copiar código"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: BROWN }}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>

            <a
              href={getWhatsAppLink(inviteCode.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl font-body text-sm font-medium hover:bg-green-600 transition mb-3"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Compartilhar via WhatsApp
            </a>

            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="w-full py-2.5 rounded-2xl font-body text-sm hover:opacity-80 transition disabled:opacity-40"
              style={{ border: "1.5px solid rgba(169,137,80,0.16)", color: "rgba(61,50,42,0.55)" }}
            >
              {generatingCode ? "Gerando..." : "Gerar novo código"}
            </button>
          </div>
        )}

        {/* Aguardando aprovação */}
        {linkStatus === "pendente" && (
          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-heading text-base" style={{ color: BROWN }}>Aguardando aprovacao</p>
                {planner && (
                  <p className="font-body text-sm" style={{ color: "rgba(61,50,42,0.50)" }}>{planner.companyName}</p>
                )}
              </div>
            </div>

            <p className="font-body text-sm mb-5" style={{ color: "rgba(61,50,42,0.55)" }}>
              A cerimonialista recebeu seu código. Assim que ela aprovar o vínculo, terá acesso ao seu painel de casamento.
            </p>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-full py-2.5 border border-red-200 text-red-400 rounded-2xl font-body text-sm hover:bg-red-50 transition disabled:opacity-40"
            >
              {removing ? "Cancelando..." : "Cancelar solicitacao"}
            </button>
          </div>
        )}

        {/* Vínculo ativo */}
        {linkStatus === "ativo" && planner && (
          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid rgba(169,137,80,0.20)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}1A` }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: GOLD }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-heading text-base" style={{ color: BROWN }}>Vinculo ativo</p>
                <p className="font-body text-sm" style={{ color: "rgba(61,50,42,0.50)" }}>{planner.companyName}</p>
              </div>
            </div>

            <p className="font-body text-sm mb-5" style={{ color: "rgba(61,50,42,0.55)" }}>
              A cerimonialista ja tem acesso ao painel do seu casamento e pode acompanhar tudo em tempo real.
            </p>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-full py-2.5 border border-red-200 text-red-400 rounded-2xl font-body text-sm hover:bg-red-50 transition disabled:opacity-40"
            >
              {removing ? "Desvinculando..." : "Desvincular cerimonialista"}
            </button>
          </div>
        )}

        {/* Info card */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(169,137,80,0.06)", border: "1.5px solid rgba(169,137,80,0.14)" }}>
          <p className="font-body text-xs" style={{ color: "rgba(61,50,42,0.70)" }}>
            <strong>Como funciona:</strong> Gere um código de convite e compartilhe com sua cerimonialista. Ela insere o código no painel dela para se vincular. Após o vínculo, ela acompanha lista de convidados, fornecedores e timeline em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
