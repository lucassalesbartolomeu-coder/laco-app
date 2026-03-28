import BottomNav from "@/components/bottom-nav";

// Wrapper that provides weddingId to BottomNav for all /casamento/[id]/* routes
export default async function CasamentoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      {/* Extra padding so content doesn't hide behind the bottom nav */}
      <div className="pb-20">{children}</div>
      <BottomNav weddingId={id} />
    </>
  );
}
