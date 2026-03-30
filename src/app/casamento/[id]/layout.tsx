import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/bottom-nav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://laco.com.vc";

  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id },
      select: { partnerName1: true, partnerName2: true },
    });
    if (!wedding) return {};
    const title = `${wedding.partnerName1} & ${wedding.partnerName2} — Laço`;
    const ogImage = `${appUrl}/api/og/${id}`;
    return {
      title,
      openGraph: { title, images: [{ url: ogImage, width: 1200, height: 630 }] },
      twitter: { card: "summary_large_image", title, images: [ogImage] },
    };
  } catch {
    return {};
  }
}

export default async function CasamentoLayout({ children, params }: Props) {
  const { id } = await params;

  return (
    <>
      <div className="pb-20">{children}</div>
      <BottomNav weddingId={id} />
    </>
  );
}
