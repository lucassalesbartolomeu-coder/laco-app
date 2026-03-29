import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://laco.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();

  // Portfolios públicos de cerimonialistas verificados com slug
  let plannerSlugs: string[] = [];
  try {
    const planners = await prisma.weddingPlanner.findMany({
      where: { isVerified: true, slug: { not: null } },
      select: { slug: true },
    });
    plannerSlugs = planners
      .map((p) => p.slug)
      .filter((s): s is string => Boolean(s));
  } catch {
    // Não-bloqueante: banco pode estar indisponível no build
  }

  // Sites públicos de casais (que possuem slug ativo)
  let weddingSlugs: string[] = [];
  try {
    const weddings = await prisma.wedding.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
    });
    weddingSlugs = weddings
      .map((w) => w.slug)
      .filter((s): s is string => Boolean(s));
  } catch {
    // Não-bloqueante: banco pode estar indisponível no build
  }

  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const plannerUrls: MetadataRoute.Sitemap = plannerSlugs.map((slug) => ({
    url: `${BASE_URL}/cerimonialista/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const weddingUrls: MetadataRoute.Sitemap = weddingSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    // Páginas estáticas principais
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/planos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/registro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/registro/cerimonialista`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Blog
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Landing pages regionais
    {
      url: `${BASE_URL}/casamento-em-sao-paulo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/casamento-no-rio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/casamento-em-bh`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Portfolios de cerimonialistas (dinâmico)
    ...plannerUrls,
    // Sites públicos de casais (dinâmico)
    ...weddingUrls,
    // Posts do blog (dinâmico)
    ...blogUrls,
  ];
}
