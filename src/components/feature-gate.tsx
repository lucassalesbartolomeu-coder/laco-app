"use client";

import Link from "next/link";
import { FEATURES, hasFeatureAccess } from "@/lib/feature-flags";
import type { FeatureName } from "@/lib/feature-flags";

interface FeatureGateProps {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userPlan?: string | null;
}

function DefaultUpgradeCard({ feature }: { feature: FeatureName }) {
  const featureDef = FEATURES[feature];
  return (
    <div className="rounded-2xl bg-white border border-gold/20 p-6 flex flex-col items-center text-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-2xl select-none">
        🔒
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold text-midnight mb-1">
          Recurso Premium
        </h3>
        <p className="font-body text-sm text-midnight/60">
          {featureDef.label} está disponível nos planos pagos.
        </p>
      </div>
      <Link
        href="/planos"
        className="inline-flex items-center justify-center gap-2 bg-gold text-white font-body font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gold/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Ver planos
      </Link>
    </div>
  );
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  userPlan,
}: FeatureGateProps) {
  // For MVP: all features are available
  if (hasFeatureAccess(userPlan, feature)) {
    return <>{children}</>;
  }

  // Feature is locked — show fallback or default upgrade card
  return <>{fallback ?? <DefaultUpgradeCard feature={feature} />}</>;
}
