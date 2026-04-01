// ─── Mais Shell — /casamento/[id]/mais ───────────────────────────────────────
"use client";
import { useParams } from "next/navigation";
import MaisClient from "@/components/app-shell/MaisClient";

export default function MaisShellPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  return <MaisClient weddingId={weddingId} />;
}
