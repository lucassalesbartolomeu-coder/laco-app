import { HeroSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeroSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
