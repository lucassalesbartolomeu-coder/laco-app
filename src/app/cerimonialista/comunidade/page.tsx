"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  isOwn: boolean;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  likeCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  comments: Comment[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className={`rounded-full bg-midnight/20 flex items-center justify-center shrink-0 ${size === "sm" ? "w-7 h-7" : "w-9 h-9"}`}>
      <span className={`font-body font-semibold text-midnight ${size === "sm" ? "text-[10px]" : "text-xs"}`}>{initials}</span>
    </div>
  );
}

function PostCard({ post, onLike, onComment, onDelete }: {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleComment() {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    await onComment(post.id, commentText);
    setCommentText("");
    setSubmitting(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* Post header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} />
          <div>
            <p className="font-body text-sm font-semibold text-midnight leading-tight">{post.author.name}</p>
            <p className="font-body text-xs text-midnight/40">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {post.isOwn && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 text-midnight/20 hover:text-red-400 transition rounded-lg hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Post content */}
      <p className="font-body text-sm text-midnight leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 font-body text-sm transition ${
            post.likedByMe ? "text-gold" : "text-midnight/40 hover:text-gold"
          }`}
        >
          <svg className="w-4 h-4" fill={post.likedByMe ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {post.likeCount > 0 && <span>{post.likeCount}</span>}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 font-body text-sm text-midnight/40 hover:text-midnight transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.comments.length > 0 ? post.comments.length : "Comentar"}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={c.author.name} size="sm" />
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <p className="font-body text-xs font-semibold text-midnight">{c.author.name}</p>
                <p className="font-body text-xs text-midnight/70 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <div className="flex gap-2.5 mt-2">
            <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
              <span className="font-body text-[10px] font-semibold text-gold">Eu</span>
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Escreva um comentário..."
                className="flex-1 px-3 py-1.5 text-xs font-body bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold/50 transition"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="px-3 py-1.5 bg-midnight text-white text-xs font-body rounded-xl disabled:opacity-40 transition hover:bg-midnight/90"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComunidadePage() {
  const { status: authStatus } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function loadPosts(cursor?: string) {
    const url = `/api/planner/community${cursor ? `?cursor=${cursor}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    if (cursor) {
      setPosts((prev) => [...prev, ...data.posts]);
    } else {
      setPosts(data.posts);
    }
    setNextCursor(data.nextCursor);
  }

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    loadPosts().finally(() => setLoading(false));
  }, [authStatus]);

  async function handlePost() {
    if (!newPostText.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/planner/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPostText }),
    });
    if (res.ok) {
      setNewPostText("");
      await loadPosts();
    }
    setSubmitting(false);
  }

  async function handleLike(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const wasLiked = post.likedByMe;
    // Optimistic
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !wasLiked, likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    await fetch(`/api/planner/community/${postId}/like`, { method: "POST" });
  }

  async function handleComment(postId: string, content: string) {
    const res = await fetch(`/api/planner/community/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const comment = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        )
      );
    }
  }

  async function handleDelete(postId: string) {
    await fetch(`/api/planner/community/${postId}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await loadPosts(nextCursor);
    setLoadingMore(false);
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-3xl text-midnight">Comunidade</h1>
        <p className="font-body text-sm text-midnight/50 mt-1">
          Troque experiências com outras cerimonialistas 💬
        </p>
      </div>

      {/* Create post */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <textarea
          ref={textareaRef}
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
          }}
          placeholder="Compartilhe uma dica, experiência ou pergunta com a comunidade..."
          rows={3}
          className="w-full font-body text-sm text-midnight placeholder:text-midnight/30 resize-none outline-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="font-body text-xs text-midnight/30">
            {newPostText.length > 0 ? `${newPostText.length} caracteres` : "Ctrl+Enter para publicar"}
          </span>
          <button
            onClick={handlePost}
            disabled={!newPostText.trim() || submitting}
            className="px-5 py-2 bg-midnight text-white font-body text-sm rounded-xl disabled:opacity-40 hover:bg-midnight/90 transition"
          >
            {submitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="font-heading text-xl text-midnight/30 mb-2">Seja a primeira a postar!</p>
          <p className="font-body text-sm text-midnight/30">
            Compartilhe dicas, faça perguntas e conecte-se com outras cerimonialistas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
            />
          ))}

          {nextCursor && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 font-body text-sm text-midnight/50 hover:text-midnight transition"
            >
              {loadingMore ? "Carregando..." : "Ver mais publicações"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
