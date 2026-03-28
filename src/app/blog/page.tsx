import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Laço — Casamentos",
  description:
    "Dicas, guias e inspirações para planejar o casamento dos seus sonhos. Tudo que você precisa saber sobre cerimoniais, decoração, lista de presentes e mais.",
  openGraph: {
    title: "Blog Laço — Tudo sobre casamentos",
    description:
      "Guias completos para noivos, dicas de fornecedores, tendências e muito mais.",
  },
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-verde-noite text-white py-20 px-4 text-center">
        <Link href="/" className="font-heading text-2xl text-white/70 hover:text-white transition mb-6 inline-block">
          Laço
        </Link>
        <h1 className="font-heading text-5xl mb-4">Blog</h1>
        <p className="font-body text-white/70 max-w-xl mx-auto">
          Guias, dicas e inspirações para planejar o casamento dos seus sonhos
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <p className="text-center font-body text-verde-noite/50">
            Nenhum artigo publicado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
              >
                {/* Cover placeholder */}
                <div className="h-40 bg-gradient-to-br from-teal/20 to-verde-noite/20 flex items-center justify-center">
                  <span className="font-heading text-4xl text-verde-noite/20">Laço</span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-teal/10 text-teal text-xs font-body rounded-full">
                      {post.category}
                    </span>
                    <span className="font-body text-xs text-verde-noite/40">{post.readTime}</span>
                  </div>

                  <h2 className="font-heading text-lg text-verde-noite leading-tight mb-2 group-hover:text-teal transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="font-body text-sm text-verde-noite/60 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  <p className="font-body text-xs text-verde-noite/40">
                    {formatDate(post.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog Laço",
            description: "Dicas e guias para planejamento de casamentos no Brasil",
            url: "https://laco.app/blog",
          }),
        }}
      />
    </div>
  );
}
