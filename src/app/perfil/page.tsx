"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";

interface ProfileData {
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  referralCode: string | null;
}

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  const referralLink = profile?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/registro?ref=${profile.referralCode}`
    : null;

  function copyReferral() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSignOut() {
    await signOut({ callbackUrl: "/login" });
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const email = session?.user?.email ?? "";
  const name = session?.user?.name ?? profile?.name ?? "";
  const initials = name
    ? name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();

  const isPlanner = profile?.role === "PLANNER" || profile?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-heading text-2xl font-semibold text-verde-noite tracking-wide">
            Laço
          </Link>
          <span className="font-body text-sm text-verde-noite/40">Perfil</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {/* Avatar + identity */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-verde-noite flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-2xl font-semibold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            {name && (
              <p className="font-heading text-xl font-semibold text-verde-noite truncate">{name}</p>
            )}
            <p className="font-body text-sm text-verde-noite/55 truncate">{email}</p>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${
              isPlanner
                ? "bg-copper/10 text-copper"
                : "bg-teal/10 text-teal"
            }`}>
              {isPlanner ? "Cerimonialista" : "Casal"}
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <p className="px-6 pt-5 pb-3 font-body text-xs font-semibold text-verde-noite/35 uppercase tracking-widest">
            Navegação
          </p>

          {isPlanner ? (
            <Link href="/cerimonialista/dashboard" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-copper/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-body text-sm font-medium text-verde-noite">Painel Cerimonialista</span>
              </div>
              <svg className="w-4 h-4 text-verde-noite/20 group-hover:text-verde-noite/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-body text-sm font-medium text-verde-noite">Meus casamentos</span>
              </div>
              <svg className="w-4 h-4 text-verde-noite/20 group-hover:text-verde-noite/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <Link href="/casamento/novo" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-verde-noite/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-verde-noite/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-body text-sm font-medium text-verde-noite">Novo casamento</span>
            </div>
            <svg className="w-4 h-4 text-verde-noite/20 group-hover:text-verde-noite/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Referral */}
        {profile?.referralCode && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <p className="font-body text-xs font-semibold text-verde-noite/35 uppercase tracking-widest mb-4">
              Indique &amp; Ganhe
            </p>
            <p className="font-body text-sm text-verde-noite/60 mb-3">
              Compartilhe seu link e ganhe benefícios quando amigos se cadastrarem.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-body text-sm text-verde-noite/60 font-mono truncate">
                {referralLink}
              </div>
              <button
                onClick={copyReferral}
                className={`px-4 py-2.5 rounded-xl text-sm font-body font-medium transition flex-shrink-0 ${
                  copied ? "bg-green-100 text-green-700" : "bg-teal text-white hover:bg-teal/90"
                }`}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* Account */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <p className="px-6 pt-5 pb-3 font-body text-xs font-semibold text-verde-noite/35 uppercase tracking-widest">
            Conta
          </p>

          {profile?.createdAt && (
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-body text-sm text-verde-noite/60">Membro desde</span>
              <span className="font-body text-sm text-verde-noite/40">
                {new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50/50 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-body text-sm font-medium text-red-500">Sair da conta</span>
            </div>
            <svg className="w-4 h-4 text-red-200 group-hover:text-red-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
