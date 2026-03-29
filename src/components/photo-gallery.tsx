"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface WeddingPhoto {
  id: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

interface PhotoGalleryProps {
  photos: WeddingPhoto[];
}

/* Placeholder blur base64 minimalista (pixel teal) */
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+A9QTwMJAAD/AgAD/AL+hc2rNAAAAABJRU5ErkJggg==";

/* ── Empty state com SVG ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 100"
        className="w-32 h-auto text-verde-noite/20"
        fill="none"
        aria-hidden="true"
      >
        <rect x="10" y="15" width="100" height="70" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M20 65 L42 38 L60 55 L75 42 L100 65 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="82" cy="32" r="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="82" y1="20" x2="82" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="82" y1="44" x2="82" y2="47" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="70" y1="32" x2="67" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="32" x2="97" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M55 80 C55 80 48 74 48 70 C48 67.2 50.2 65 53 65 C54.2 65 55 65.8 55 65.8 C55 65.8 55.8 65 57 65 C59.8 65 62 67.2 62 70 C62 74 55 80 55 80 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-center space-y-1">
        <p className="font-body text-verde-noite/60 text-base font-medium">
          As fotos vão aparecer aqui em breve
        </p>
        <p className="font-body text-verde-noite/35 text-sm">
          Os noivos ainda estão preparando a galeria
        </p>
      </div>
    </div>
  );
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* ── Touch / swipe refs ── */
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const sorted =
    photos && photos.length > 0
      ? [...photos].sort((a, b) => a.sortOrder - b.sortOrder)
      : [];

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    if (sorted.length === 0) return;
    setLightboxIndex((i) => (i === null ? null : (i + 1) % sorted.length));
  }, [sorted.length]);

  const goPrev = useCallback(() => {
    if (sorted.length === 0) return;
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + sorted.length) % sorted.length
    );
  }, [sorted.length]);

  /* ── Keyboard navigation ── */
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

  /* ── Bloqueia scroll do body quando lightbox aberto ── */
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  /* ── Touch handlers (swipe) ── */
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  /* ── Empty state ── */
  if (sorted.length === 0) {
    return <EmptyState />;
  }

  const currentPhoto = lightboxIndex !== null ? sorted[lightboxIndex] : null;

  return (
    <>
      {/* ── Grid masonry ── */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {sorted.map((photo, idx) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="break-inside-avoid rounded-xl overflow-hidden relative group w-full block cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
            aria-label={photo.caption ?? `Foto ${idx + 1}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? `Foto do casamento ${idx + 1}`}
              width={600}
              height={400}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              loading="lazy"
              unoptimized
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-body text-xs text-white">{photo.caption}</p>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && currentPhoto && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Galeria de fotos"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Botão fechar */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Fechar galeria"
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Botão anterior */}
            {sorted.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Foto anterior"
                className="absolute left-4 z-10 text-white/70 hover:text-white transition p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Imagem com animação de abertura scale 0.8 → 1 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative max-w-5xl max-h-[90vh] w-full px-16"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentPhoto.url}
                    alt={currentPhoto.caption ?? `Foto ${lightboxIndex + 1}`}
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    unoptimized
                  />
                </div>
                {currentPhoto.caption && (
                  <p className="text-center font-body text-sm text-white/70 mt-4">
                    {currentPhoto.caption}
                  </p>
                )}
                <p className="text-center font-body text-xs text-white/30 mt-2">
                  {lightboxIndex + 1} / {sorted.length}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Botão próxima */}
            {sorted.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Próxima foto"
                className="absolute right-4 z-10 text-white/70 hover:text-white transition p-3 rounded-full bg-white/10 hover:bg-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
