"use client";

import { useEffect } from "react";
import PlannerBottomNav from "@/components/planner-bottom-nav";

function usePwaManifest() {
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prev = link?.getAttribute("href");
    if (link) link.setAttribute("href", "/manifest-pro.json");
    return () => {
      if (link && prev) link.setAttribute("href", prev);
    };
  }, []);
}

export default function CerimonialistaLayout({ children }: { children: React.ReactNode }) {
  usePwaManifest();

  return (
    <div className="min-h-screen" style={{ background: "#FAF6EF" }}>
      <main className="overflow-auto min-h-screen">
        {children}
      </main>
      <PlannerBottomNav />
    </div>
  );
}
