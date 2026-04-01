"use client";

import { useParams } from "next/navigation";
import PlanejarClient from "@/components/app-shell/PlanejarClient";

export default function PlanejarPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  return <PlanejarClient weddingId={weddingId} />;
}
