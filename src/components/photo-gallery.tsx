"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";

interface WeddingPhoto {
  id: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

interface PhotoGalleryProps {
  photos: WeddingPhoto[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  /* ── Empty state ── */
  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="text-5xl select-none" aria-hidden="true">
          ✨
        </span>
        <p className="font-body text-verde-noite/50 italic text-lg">
          As fotos vão aparecer aqui
        </p>
      </div>
    );
  }

  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* ── Masonry grid ── */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {sorted.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="break-inside-avoid rounded-xl overflow-hidden relative group w-full block cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
            aria-label={photo.caption ?? `Foto ${idx + 1}`}
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `Foto do casamento ${idx + 1}`}
              width={600}
              height={400}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-body text-xs text-white">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Fechar galeria"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Foto anterior"
              className="absolute left-4 text-white/70 hover:text-white transition p-3 rounded-full bg-white/10 hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={sorted[lightboxIndex].url}
                alt={sorted[lightboxIndex].caption ?? `Foto ${lightboxIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                unoptimized
              />
            </div>
            {sorted[lightboxIndex].caption && (
              <p className="text-center font-body text-sm text-white/70 mt-4">
                {sorted[lightboxIndex].caption}
              </p>
            )}
            <p className="text-center font-body text-xs text-white/30 mt-2">
              {lightboxIndex + 1} / {sorted.length}
            </p>
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Próxima foto"
              className="absolute right-4 text-white/70 hover:text-white transition p-3 rounded-full bg-white/10 hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
