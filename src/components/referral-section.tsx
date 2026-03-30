"use client";

import { useEffect, useState } from "react";

interface ReferralHistory {
  id: string;
  name: string | null;
  createdAt: string;
  converted: boolean;
}

interface ReferralData {
  referralCode: string;
  referralCount: number;
  convertedCount: number;
  history: ReferralHistory[];
  commissionRate: number | null;
}

interface ReferralSectionProps {
  isPlanner: boolean;
}

const AMBASSADOR_THRESHOLD = 5;

export default function ReferralSection({ isPlanner }: ReferralSectionProps) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/referral")
      .then((r) => r.json())
      .then((d: ReferralData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${data.referralCode}`
      : `laco.app/r/${data.referralCode}`;

  const pendingCount = data.referralCount - data.convertedCount;
  const isAmbassador = data.convertedCount >= AMBASSADOR_THRESHOLD;

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappText = encodeURIComponent(
    `Oi! Estou usando o Laço para organizar meu casamento e adorei. Você pode se cadastrar pelo meu link e ganhar benefícios: ${referralLink}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="space-y-4">
      {/* Main referral card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#1A1F3A] via-[#1A1F3A] to-[#C9A96E]" />

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-body text-xs font-semibold text-midnight/35 uppercase tracking-widest mb-1">
                Indique &amp; Ganhe
              </p>
              <h3 className="font-heading text-base font-semibold text-midnight">
                Compartilhe o Laço
              </h3>
            </div>

            {/* Ambassador badge */}
            {isAmbassador && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20">
                <svg className="w-3.5 h-3.5 text-[#C9A96E]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-body text-xs font-semibold text-[#C9A96E]">Embaixador Laço</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#F0EDE7] rounded-2xl p-3 text-center">
              <p className="font-heading text-2xl font-bold text-[#1A1F3A]">{data.referralCount}</p>
              <p className="font-body text-[10px] text-midnight/50 mt-0.5 leading-tight">Indicados</p>
            </div>
            <div className="bg-[#1A1F3A]/8 rounded-2xl p-3 text-center">
              <p className="font-heading text-2xl font-bold text-[#1A1F3A]">{data.convertedCount}</p>
              <p className="font-body text-[10px] text-midnight/50 mt-0.5 leading-tight">Convertidos</p>
            </div>
            <div className="bg-[#F0EDE7] rounded-2xl p-3 text-center">
              <p className="font-heading text-2xl font-bold text-[#C9A96E]">{pendingCount}</p>
              <p className="font-body text-[10px] text-midnight/50 mt-0.5 leading-tight">Pendentes</p>
            </div>
          </div>

          {/* Ambassador progress bar (before reaching threshold) */}
          {!isAmbassador && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-body text-xs text-midnight/50">
                  Progresso para Embaixador
                </span>
                <span className="font-body text-xs font-semibold text-[#C9A96E]">
                  {data.convertedCount}/{AMBASSADOR_THRESHOLD}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1A1F3A] to-[#C9A96E] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (data.convertedCount / AMBASSADOR_THRESHOLD) * 100)}%` }}
                />
              </div>
              <p className="font-body text-[10px] text-midnight/40 mt-1">
                {AMBASSADOR_THRESHOLD - data.convertedCount} conversões restantes para ganhar o badge
              </p>
            </div>
          )}

          {/* Referral link */}
          <div className="bg-[#F0EDE7] rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-[#1A1F3A] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="font-body text-sm text-midnight/70 font-mono truncate flex-1">
              {referralLink}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-medium transition ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-[#1A1F3A] text-white hover:bg-[#1A1F3A]/90"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar link
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-medium bg-[#25D366] text-white hover:bg-[#25D366]/90 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Planner commissions panel */}
      {isPlanner && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-body text-xs font-semibold text-midnight/35 uppercase tracking-widest">
                Comissões
              </p>
              {data.commissionRate !== null && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/10 font-body text-xs font-semibold text-[#C9A96E]">
                  {data.commissionRate}% por casal
                </span>
              )}
            </div>

            {data.history.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F0EDE7] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-midnight/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="font-body text-sm text-midnight/50">Nenhum casal indicado ainda</p>
                <p className="font-body text-xs text-midnight/35 mt-1">
                  Compartilhe seu link para começar a ganhar comissões
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 bg-[#F0EDE7]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        entry.converted ? "bg-[#1A1F3A]/10" : "bg-gray-100"
                      }`}>
                        <svg
                          className={`w-4 h-4 ${entry.converted ? "text-[#1A1F3A]" : "text-midnight/30"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-sm font-medium text-midnight truncate">
                          {entry.name ?? "Usuário"}
                        </p>
                        <p className="font-body text-[10px] text-midnight/40">
                          {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full font-body text-[10px] font-semibold ${
                      entry.converted
                        ? "bg-[#1A1F3A]/10 text-[#1A1F3A]"
                        : "bg-gray-100 text-midnight/40"
                    }`}>
                      {entry.converted ? "Convertido" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Benefits info (non-planner) */}
      {!isPlanner && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <p className="font-body text-xs font-semibold text-midnight/35 uppercase tracking-widest mb-4">
            Benefícios
          </p>
          <div className="space-y-3">
            {[
              { threshold: 1, label: "1 indicação convertida", benefit: "Desconto exclusivo no próximo plano" },
              { threshold: 3, label: "3 indicações convertidas", benefit: "Acesso antecipado a novidades" },
              { threshold: AMBASSADOR_THRESHOLD, label: `${AMBASSADOR_THRESHOLD} indicações convertidas`, benefit: "Badge Embaixador Laço + benefícios VIP" },
            ].map((item) => {
              const unlocked = data.convertedCount >= item.threshold;
              return (
                <div key={item.threshold} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  unlocked ? "bg-[#1A1F3A]/5" : "bg-[#F0EDE7]"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    unlocked ? "bg-[#1A1F3A] text-white" : "bg-gray-100 text-midnight/30"
                  }`}>
                    {unlocked ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-body text-xs font-semibold ${unlocked ? "text-[#1A1F3A]" : "text-midnight/40"}`}>
                      {item.label}
                    </p>
                    <p className="font-body text-[10px] text-midnight/50 mt-0.5">{item.benefit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
