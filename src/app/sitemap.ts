import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://laco.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();

  // Fetch verified planner portfolios that have a public slug
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
    // Non-blocking: DB may be unavailable at build time
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

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/casamento-em-sao-paulo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/casamento-no-rio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/casamento-em-bh`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...plannerUrls,
    ...blogUrls,
  ];
}
