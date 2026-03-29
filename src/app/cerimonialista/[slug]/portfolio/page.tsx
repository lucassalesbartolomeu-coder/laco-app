import { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Tipos exportados (usados pelo PortfolioClient) ───────────────────────────

export interface PlannerProfile {
  id: string;
  companyName: string;
  bio: string | null;
  instagram: string | null;
  website: string | null;
  region: string | null;
  specialties: string[];
  isVerified: boolean;
  weddingCount: number;
  yearsExperience: number;
  avatarUrl: string | null;
  heroCoverImage: string | null;
}

export interface PortfolioWedding {
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  style: string | null;
  coverImage: string | null;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://laco.app";
    const res = await fetch(`${baseUrl}/api/public/planner/${slug}/portfolio`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("not found");

    const data = (await res.json()) as { planner: PlannerProfile };
    const p = data.planner;
    const city = p.region ?? "";
    const description =
      p.bio ??
      `Conheça o portfólio de ${p.companyName}${city ? `, cerimonialista em ${city}` : ""}. ${p.weddingCount} casamentos realizados.`;

    return {
      title: `${p.companyName} | Cerimonialista | Laço`,
      description,
      openGraph: {
        title: `${p.companyName} | Cerimonialista | Laço`,
        description,
        type: "profile",
        siteName: "Laço",
        images: p.heroCoverImage
          ? [{ url: p.heroCoverImage, width: 1200, height: 630, alt: p.companyName }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${p.companyName} | Cerimonialista | Laço`,
        description,
        images: p.heroCoverImage ? [p.heroCoverImage] : [],
      },
    };
  } catch {
    return {
      title: "Cerimonialista | Laço",
      description: "Portfólio de cerimonialista no Laço.",
    };
  }
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  return <PortfolioClient slug={slug} />;
}
