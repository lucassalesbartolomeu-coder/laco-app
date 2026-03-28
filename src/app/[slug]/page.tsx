import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WeddingClientPage from "./wedding-client";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wedding = await prisma.wedding.findUnique({
    where: { slug: params.slug },
    select: {
      partnerName1: true,
      partnerName2: true,
      weddingDate: true,
      venue: true,
      city: true,
      coverImage: true,
      storyText: true,
      style: true,
    },
  });

  if (!wedding) {
    return { title: "Casamento | Laço" };
  }

  const couple = `${wedding.partnerName1} & ${wedding.partnerName2}`;
  const date = wedding.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const title = `${couple} | Laço`;
  const description = date
    ? `Confirme sua presença no casamento de ${couple} — ${date}${wedding.venue ? ` em ${wedding.venue}` : ""}`
    : `Confirme sua presença no casamento de ${couple}`;

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://laco.app";

  // Build OG image URL: prefer real cover image, fallback to generated OG
  const ogImageUrl = wedding.coverImage
    ? wedding.coverImage
    : (() => {
        const ogParams = new URLSearchParams({
          names: couple,
          ...(date ? { date } : {}),
          ...(wedding.style ? { style: wedding.style } : {}),
        });
        return `${baseUrl}/api/og?${ogParams.toString()}`;
      })();

  return {
    title,
    description,
    openGraph: {
      title: couple,
      description,
      type: