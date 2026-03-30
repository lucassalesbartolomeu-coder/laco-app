import { useEffect, useState, useCallback } from "react";

export interface GuestData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  category: string | null;
  plusOne: boolean;
  city: string | null;
  state: string | null;
}

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

export function useGuests(weddingId: string | null) {
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [stats, setStats] = useState<GuestStats>({ total: 0, confirmed: 0, pending: 0, declined: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!weddingId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [guestsRes, statsRes] = await Promise.all([
        fetch(`/api/weddings/${weddingId}/guests`),
        fetch(`/api/weddings/${weddingId}/guests/stats`),
      ]);
      if (!guestsRes.ok) throw new Error("Erro ao carregar convidados");
      const [guestsData, statsData] = await Promise.all([
        guestsRes.json(),
        statsRes.ok ? statsRes.json() : null,
      ]);
      setGuests(Array.isArray(guestsData) ? guestsData : []);
      if (statsData) setStats(statsData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { guests, stats, loading, error, refetch };
}
