"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

export default function FinalCta() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link
        href="/registro?plano=pro"
        onClick={() => {
          track("plan_selected", { plan_name: "pro", source: "final_cta" });
          track("paywall_hit", { plan: "pro" });
        }}
        className="inline-flex items-center justify-center gap-2 bg-gold text-white font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-gold/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Começar trial Pro grátis
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
      <Link
        href="/registro"
        className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-body text-base px-8 py-4 rounded-xl hover:bg-white/5 transition-all"
      >
        Plano gratuito
      </Link>
    </div>
  );
}
