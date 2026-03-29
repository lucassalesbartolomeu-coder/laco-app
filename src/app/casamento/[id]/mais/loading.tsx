import { HeroSkeleton, ListItemSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-off-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeroSkeleton />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
