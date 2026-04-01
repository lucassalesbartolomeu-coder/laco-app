// ─── Execução Shell — /casamento/[id]/execucao ───────────────────────────────
"use client";
import { useParams } from "next/navigation";
import ExecucaoClient from "@/components/app-shell/ExecucaoClient";

export default function ExecucaoShellPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  return <ExecucaoClient weddingId={weddingId} />;
}
