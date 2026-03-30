/* ─── Laço Brand Illustrations ───────────────────────────────────────────────
 * Inline SVG React components — 200×160 viewBox, brand palette:
 *   verde-noite  #1A1F3A
 *   gold       #C9A96E
 *   gold         #C9A96E
 *   cream        #F0EDE7
 * ─────────────────────────────────────────────────────────────────────────── */

export function EmptyGuests({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lista de convidados vazia"
    >
      {/* Ground / platform */}
      <ellipse cx="100" cy="148" rx="72" ry="8" fill="#1A1F3A" fillOpacity="0.06" />

      {/* ── Center person (taller) ── */}
      {/* body */}
      <rect x="85" y="90" width="30" height="42" rx="10" fill="#1A1F3A" fillOpacity="0.15" />
      {/* head */}
      <circle cx="100" cy="76" r="14" fill="#F0EDE7" stroke="#1A1F3A" strokeOpacity="0.3" strokeWidth="1.5" />
      {/* face dots */}
      <circle cx="95" cy="75" r="1.5" fill="#1A1F3A" fillOpacity="0.4" />
      <circle cx="105" cy="75" r="1.5" fill="#1A1F3A" fillOpacity="0.4" />
      {/* small smile */}
      <path d="M95 81 Q100 85 105 81" stroke="#1A1F3A" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* ── Left person (shorter) ── */}
      <rect x="45" y="98" width="26" height="36" rx="9" fill="#C9A96E" fillOpacity="0.18" />
      <circle cx="58" cy="85" r="12" fill="#F0EDE7" stroke="#C9A96E" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="53.5" cy="84" r="1.3" fill="#1A1F3A" fillOpacity="0.35" />
      <circle cx="62.5" cy="84" r="1.3" fill="#1A1F3A" fillOpacity="0.35" />

      {/* ── Right person (shorter) ── */}
      <rect x="129" y="98" width="26" height="36" rx="9" fill="#C9A96E" fillOpacity="0.25" />
      <circle cx="142" cy="85" r="12" fill="#F0EDE7" stroke="#C9A96E" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="137.5" cy="84" r="1.3" fill="#1A1F3A" fillOpacity="0.35" />
      <circle cx="146.5" cy="84" r="1.3" fill="#1A1F3A" fillOpacity="0.35" />

      {/* Dashed circle suggesting "add someone" */}
      <circle cx="100" cy="30" r="18" stroke="#1A1F3A" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="100" y1="22" x2="100" y2="38" stroke="#1A1F3A" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <line x1="92" y1="30" x2="108" y2="30" stroke="#1A1F3A" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyGifts({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lista de presentes vazia"
    >
      {/* Shadow */}
      <ellipse cx="100" cy="148" rx="54" ry="7" fill="#1A1F3A" fillOpacity="0.06" />

      {/* Box bottom */}
      <rect x="58" y="95" width="84" height="48" rx="6" fill="#F0EDE7" stroke="#1A1F3A" strokeOpacity="0.18" strokeWidth="1.5" />

      {/* Box lid */}
      <rect x="52" y="79" width="96" height="22" rx="6" fill="#1A1F3A" fillOpacity="0.12" stroke="#1A1F3A" strokeOpacity="0.2" strokeWidth="1.5" />

      {/* Ribbon vertical */}
      <rect x="94" y="79" width="12" height="64" rx="3" fill="#C9A96E" fillOpacity="0.55" />

      {/* Ribbon horizontal on lid */}
      <rect x="52" y="85" width="96" height="10" rx="3" fill="#C9A96E" fillOpacity="0.45" />

      {/* Bow left loop */}
      <path
        d="M100 79 C88 60 68 58 70 72 C72 82 90 80 100 79Z"
        fill="#C9A96E"
        fillOpacity="0.7"
      />
      {/* Bow right loop */}
      <path
        d="M100 79 C112 60 132 58 130 72 C128 82 110 80 100 79Z"
        fill="#C9A96E"
        fillOpacity="0.7"
      />
      {/* Bow knot */}
      <circle cx="100" cy="79" r="6" fill="#C9A96E" />

      {/* Small star accents */}
      <circle cx="74" cy="118" r="3" fill="#C9A96E" fillOpacity="0.5" />
      <circle cx="126" cy="112" r="2.5" fill="#C9A96E" fillOpacity="0.4" />
      <circle cx="118" cy="128" r="2" fill="#C9A96E" fillOpacity="0.3" />
    </svg>
  );
}

export function Illustration404({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Página não encontrada"
    >
      {/* Loose ribbon / broken knot — left strand */}
      <path
        d="M60 40 C55 55 45 65 50 80 C55 95 70 90 80 100 C90 110 88 125 80 135"
        stroke="#1A1F3A"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.8"
      />
      {/* Right strand */}
      <path
        d="M140 40 C145 55 155 65 150 80 C145 95 130 90 120 100 C110 110 112 125 120 135"
        stroke="#C9A96E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.85"
      />

      {/* Where the knot should be — broken gap hint */}
      <circle cx="100" cy="80" r="14" fill="#F0EDE7" stroke="#C9A96E" strokeWidth="2" strokeDasharray="5 3" />
      {/* X mark inside knot area */}
      <line x1="94" y1="74" x2="106" y2="86" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="106" y1="74" x2="94" y2="86" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Top loop left */}
      <path
        d="M60 40 C50 22 72 12 80 24 C86 34 78 44 70 48"
        stroke="#1A1F3A"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.6"
      />
      {/* Top loop right */}
      <path
        d="M140 40 C150 22 128 12 120 24 C114 34 122 44 130 48"
        stroke="#C9A96E"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.6"
      />

      {/* Shadow */}
      <ellipse cx="100" cy="150" rx="48" ry="6" fill="#1A1F3A" fillOpacity="0.06" />
    </svg>
  );
}

export function Celebration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Celebração"
    >
      {/* ── Ring ── */}
      {/* Band */}
      <circle cx="100" cy="95" r="30" stroke="#C9A96E" strokeWidth="10" fill="none" />
      {/* Diamond highlight */}
      <polygon points="100,52 92,64 100,68 108,64" fill="#C9A96E" />
      <polygon points="100,52 108,64 100,74 92,64" fill="#C9A96E" fillOpacity="0.6" />
      <line x1="92" y1="64" x2="108" y2="64" stroke="#1A1F3A" strokeOpacity="0.15" strokeWidth="1" />
      {/* Diamond shine */}
      <line x1="97" y1="56" x2="94" y2="62" stroke="white" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />

      {/* ── Confetti ── */}
      {/* Rectangles */}
      <rect x="38" y="30" width="8" height="5" rx="1.5" fill="#C9A96E" fillOpacity="0.8" transform="rotate(-20 38 30)" />
      <rect x="155" y="25" width="8" height="5" rx="1.5" fill="#1A1F3A" fillOpacity="0.5" transform="rotate(15 155 25)" />
      <rect x="62" y="18" width="6" height="4" rx="1.5" fill="#C9A96E" transform="rotate(10 62 18)" />
      <rect x="130" y="18" width="6" height="4" rx="1.5" fill="#C9A96E" fillOpacity="0.6" transform="rotate(-30 130 18)" />
      <rect x="45" y="55" width="7" height="4" rx="1.5" fill="#C9A96E" fillOpacity="0.7" transform="rotate(25 45 55)" />
      <rect x="148" y="58" width="7" height="4" rx="1.5" fill="#1A1F3A" fillOpacity="0.4" transform="rotate(-15 148 58)" />

      {/* Dots */}
      <circle cx="55" cy="38" r="4" fill="#C9A96E" fillOpacity="0.8" />
      <circle cx="145" cy="42" r="3.5" fill="#C9A96E" fillOpacity="0.7" />
      <circle cx="75" cy="22" r="3" fill="#1A1F3A" fillOpacity="0.35" />
      <circle cx="125" cy="26" r="3" fill="#C9A96E" fillOpacity="0.6" />
      <circle cx="32" cy="65" r="2.5" fill="#C9A96E" fillOpacity="0.5" />
      <circle cx="168" cy="68" r="2.5" fill="#C9A96E" fillOpacity="0.55" />

      {/* Streamers */}
      <path d="M36 20 C38 28 30 35 34 42" stroke="#C9A96E" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M164 20 C162 28 170 35 166 42" stroke="#C9A96E" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M80 12 C82 18 76 24 80 30" stroke="#1A1F3A" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M120 12 C118 18 124 24 120 30" stroke="#C9A96E" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Sparkle stars */}
      <path d="M170 40 L171.5 44 L175 40 L171.5 36Z" fill="#C9A96E" />
      <path d="M28 45 L29.5 49 L33 45 L29.5 41Z" fill="#C9A96E" fillOpacity="0.7" />

      {/* Shadow */}
      <ellipse cx="100" cy="148" rx="40" ry="6" fill="#1A1F3A" fillOpacity="0.06" />
    </svg>
  );
}
