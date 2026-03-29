import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/cerimonialista/",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/casamento/",
          "/cerimonialista/*/clientes",
          "/cerimonialista/*/agenda",
          "/cerimonialista/*/orcamentos",
          "/cerimonialista/*/contratos",
          "/onboarding/",
          "/perfil/",
          "/parceiro/",
          "/contratos/",
          "/questionario/",
        ],
      },
    ],
    sitemap: "https://laco.app/sitemap.xml",
  };
}
