// ─── Planejar Shell — /casamento/[id]/planejar ────────────────────────────────
// Wrapper com phone shell. Integre no seu page.tsx existente.
"use client";
import { useParams } from "next/navigation";
import PlanejarClient from "@/components/app-shell/PlanejarClient";

export default function PlanejarShellPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  return <PlanejarClient weddingId={weddingId} />;
}
