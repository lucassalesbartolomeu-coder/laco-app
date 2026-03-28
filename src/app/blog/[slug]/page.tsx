import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post não encontrado" };

  return {
    title: `${post.title} | Blog Laço`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `https://laco.app/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Laço",
      url: "https://laco.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Laço",
      url: "https://laco.app",
    },
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-verde-noite text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="font-heading text-xl text-white/80 hover:text-white transition">
            Laço
          </Link>
          <span className="text-white/30">/</span>
          <Link href="/blog" className="font-body text-sm text-white/60 hover:text-white transition">
            Blog
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-teal/10 text-teal text-xs font-body rounded-full">
              {post.category}
            </span>
            <span className="font-body text-xs text-verde-noite/40">{post.readTime} de leitura</span>
          </div>
          <h1 className="font-heading text-4xl text-verde-noite leading-tight mb-4">
            {post.title}
          </h1>
          <p className="font-body text-lg text-verde-noite/60 leading-relaxed mb-4">
            {post.excerpt}
          </p>
          <p className="font-body text-sm text-verde-noite/40">
            Publicado em {formatDate(post.date)}
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-verde max-w-none font-body text-verde-noite/80 leading-relaxed
          [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-verde-noite [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:font-heading [&_h3]:text-xl [&_h3]:text-verde-noite [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6
          [&_li]:mb-1
          [&_strong]:font-semibold [&_strong]:text-verde-noite
          [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
          [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:font-body [&_th]:text-sm
          [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-gray-200 [&_td]:font-body [&_td]:text-sm
          [&_blockquote]:border-l-4 [&_blockquote]:border-teal [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-verde-noite/60
          [&_hr]:my-8 [&_hr]:border-gray-200
        ">
          <MDXRemote source={post.content} />
        </div>

        {/* CTA */}
        <div className="mt-12 bg-verde-noite rounded-2xl p-8 text-center text-white">
          <h3 className="font-heading text-2xl mb-2">Planeje seu casamento com o Laço</h3>
          <p className="font-body text-white/70 mb-6">
            Crie seu site de casamento, gerencie convidados e lista de presentes — tudo em um só lugar.
          </p>
          <Link
            href="/registro"
            className="inline-block bg-copper text-white font-body font-semibold px-8 py-3 rounded-xl hover:bg-copper/90 transition"
          >
            Criar conta gratuita
          </Link>
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link href="/blog" className="font-body text-sm text-teal hover:underline">
            ← Voltar ao Blog
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
    </div>
  );
}
