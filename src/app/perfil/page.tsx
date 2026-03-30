"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import ReferralSection from "@/components/referral-section";

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

  async function handleSignOut() {
    await signOut({ callbackUrl: "/login" });
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-fog pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-heading text-2xl font-semibold text-midnight tracking-wide">
            Laço
          </Link>
          <span className="font-body text-sm text-midnight/40">Perfil</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {/* Avatar + identity */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-midnight flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-2xl font-semibold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            {name && (
              <p className="font-heading text-xl font-semibold text-midnight truncate">{name}</p>
            )}
            <p className="font-body text-sm text-midnight/55 truncate">{email}</p>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${
              isPlanner
                ? "bg-gold/10 text-gold"
                : "bg-midnight/10 text-midnight"
            }`}>
              {isPlanner ? "Cerimonialista" : "Casal"}
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <p className="px-6 pt-5 pb-3 font-body text-xs font-semibold text-midnight/35 uppercase tracking-widest">
            Navegação
          </p>

          {isPlanner ? (
            <Link href="/cerimonialista/dashboard" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-body text-sm font-medium text-midnight">Painel Cerimonialista</span>
              </div>
              <svg className="w-4 h-4 text-midnight/20 group-hover:text-midnight/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-midnight/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-body text-sm font-medium text-midnight">Meus casamentos</span>
              </div>
              <svg className="w-4 h-4 text-midnight/20 group-hover:text-midnight/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <Link href="/casamento/novo" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-midnight/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-midnight/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-body text-sm font-medium text-midnight">Novo casamento</span>
            </div>
            <svg className="w-4 h-4 text-midnight/20 group-hover:text-midnight/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Referral */}
        <ReferralSection isPlanner={isPlanner} />

        {/* Account */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <p className="px-6 pt-5 pb-3 font-body text-xs font-semibold text-midnight/35 uppercase tracking-widest">
            Conta
          </p>

          {profile?.createdAt && (
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-body text-sm text-midnight/60">Membro desde</span>
              <span className="font-body text-sm text-midnight/40">
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
