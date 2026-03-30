import { useEffect, useState, useCallback } from "react";

export interface WeddingData {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
  [key: string]: unknown;
}

export function useWedding(id: string | null) {
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/weddings/${id}`);
      if (!res.ok) throw new Error("Casamento não encontrado");
      setWedding(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { wedding, loading, error, refetch };
}
