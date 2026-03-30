"use client";

import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

export function useRealtimeGuests(weddingId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!weddingId || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`guests-${weddingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Guest",
          filter: `weddingId=eq.${weddingId}`,
        },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weddingId, onUpdate]);
}
