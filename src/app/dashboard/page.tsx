"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import DashboardClient from "@/components/app-shell/DashboardClient";

interface Wedding {
  id: string;
  userId: string;
  partnerUserId: string | null;
  partnerInviteToken: string | null;
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

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}


function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
}

// ── Main page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadWeddings = useCallback(() => {
    if (status !== "authenticated") return;
    fetch("/api/weddings")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setWeddings(list);
        setLoading(false);
        // Fetch guest stats for first wedding
        if (list.length > 0) fetchGuestStats(list[0].id);
      })
      .catch(() => setLoading(false));
  }, [status]);

  async function fetchGuestStats(weddingId: string) {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/stats`);
      if (!res.ok) return;
      const stats = await res.json();
      setGuestStats({
        total: stats.total,
        confirmed: stats.confirmed,
        declined: stats.declined,
        pending: stats.pending,
      });
    } catch {
      // silently fail
    }
  }

  useEffect(() => { loadWeddings(); }, [loadWeddings]);


  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-midnight/40">Carregando…</p>
        </div>
      </div>
    );
  }

  const w = weddings[0] ?? null;
  const days = w ? daysUntil(w.weddingDate) : null;

  return (
    <DashboardClient
      weddingId={w?.id}
      partnerName1={w?.partnerName1}
      partnerName2={w?.partnerName2}
      daysUntil={days ?? undefined}
      guestTotal={guestStats?.total}
      guestConfirmed={guestStats?.confirmed}
    />
  );
}
