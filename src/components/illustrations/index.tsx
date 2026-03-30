/* ─── Laço — Ilustrações SVG inline ──────────────────────────────────────────
 * Componentes React com SVG inline — viewBox 200×160, paleta da marca:
 *   verde-noite  #1A1F3A
 *   midnight         #1A1F3A
 *   gold       #C9A96E
 *   cream        #FFF8F0
 *   off-white    #F0EDE7
 * ─────────────────────────────────────────────────────────────────────────── */

/* ── 1. IllustrationEmptyGuests ─────────────────────────────────────────── */

export function IllustrationEmptyGuests({ className = "" }: { className?: string }) {
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
      {/* Sombra no chão */}
      <ellipse cx="100" cy="150" rx="74" ry="7" fill="#1A1F3A" fillOpacity="0.07" />

      {/* ── Casal central ── */}
      {/* Noivo — corpo */}
      <rect x="88" y="92" width="22" height="46" rx="11" fill="#1A1F3A" fillOpacity="0.18" />
      {/* Noivo — cabeça */}
      <circle cx="99" cy="78" r="13" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1.5" strokeOpacity="0.35" />
      {/* Noivo — olhos */}
      <circle cx="94.5" cy="77" r="1.4" fill="#1A1F3A" fillOpacity="0.45" />
      <circle cx="103.5" cy="77" r="1.4" fill="#1A1F3A" fillOpacity="0.45" />
      {/* Noivo — sorriso */}
      <path d="M94.5 82 Q99 86 103.5 82" stroke="#1A1F3A" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Noiva — detalhe vestido (triângulo) */}
      <path d="M88 138 L82 92 L88 92 Z" fill="#C9A96E" fillOpacity="0.22" />
      <path d="M110 138 L118 92 L110 92 Z" fill="#C9A96E" fillOpacity="0.22" />

      {/* ── Convidado à esquerda ── */}
      <rect x="42" y="100" width="20" height="38" rx="10" fill="#C9A96E" fillOpacity="0.16" />
      <circle cx="52" cy="87" r="11" fill="#FFF8F0" stroke="#C9A96E" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="48" cy="86" r="1.2" fill="#1A1F3A" fillOpacity="0.35" />
      <circle cx="56" cy="86" r="1.2" fill="#1A1F3A" fillOpacity="0.35" />

      {/* ── Convidado à direita ── */}
      <rect x="138" y="100" width="20" height="38" rx="10" fill="#1A1F3A" fillOpacity="0.18" />
      <circle cx="148" cy="87" r="11" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="144" cy="86" r="1.2" fill="#1A1F3A" fillOpacity="0.35" />
      <circle cx="152" cy="86" r="1.2" fill="#1A1F3A" fillOpacity="0.35" />

      {/* ── Convidado atrás esquerda (menor, mais desbotado) ── */}
      <rect x="20" y="108" width="16" height="30" rx="8" fill="#1A1F3A" fillOpacity="0.08" />
      <circle cx="28" cy="97" r="9" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1" strokeOpacity="0.18" />

      {/* ── Convidado atrás direita ── */}
      <rect x="164" y="108" width="16" height="30" rx="8" fill="#1A1F3A" fillOpacity="0.08" />
      <circle cx="172" cy="97" r="9" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1" strokeOpacity="0.18" />

      {/* ── Círculo tracejado "adicionar" no topo ── */}
      <circle
        cx="100"
        cy="28"
        r="17"
        stroke="#C9A96E"
        strokeOpacity="0.3"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <line x1="100" y1="21" x2="100" y2="35" stroke="#C9A96E" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      <line x1="93" y1="28" x2="107" y2="28" stroke="#C9A96E" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── 2. IllustrationEmptyGifts ──────────────────────────────────────────── */

export function IllustrationEmptyGifts({ className = "" }: { className?: string }) {
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
      {/* Sombra */}
      <ellipse cx="100" cy="149" rx="56" ry="7" fill="#1A1F3A" fillOpacity="0.07" />

      {/* Caixa — corpo */}
      <rect x="56" y="96" width="88" height="47" rx="7" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1.5" strokeOpacity="0.35" />

      {/* Caixa — tampa */}
      <rect x="50" y="79" width="100" height="23" rx="7" fill="#1A1F3A" fillOpacity="0.14" stroke="#1A1F3A" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Fita vertical */}
      <rect x="93" y="79" width="14" height="64" rx="3.5" fill="#C9A96E" fillOpacity="0.6" />

      {/* Fita horizontal na tampa */}
      <rect x="50" y="86" width="100" height="10" rx="3" fill="#C9A96E" fillOpacity="0.5" />

      {/* Laço — alça esquerda */}
      <path
        d="M100 79 C88 60 64 57 66 72 C68 83 88 81 100 79Z"
        fill="#C9A96E"
        fillOpacity="0.75"
      />
      {/* Laço — alça direita */}
      <path
        d="M100 79 C112 60 136 57 134 72 C132 83 112 81 100 79Z"
        fill="#C9A96E"
        fillOpacity="0.75"
      />
      {/* Laço — nó central */}
      <circle cx="100" cy="79" r="7" fill="#1A1F3A" />
      <circle cx="100" cy="79" r="4" fill="#C9A96E" fillOpacity="0.9" />

      {/* Estrelas decorativas */}
      <circle cx="72" cy="118" r="3" fill="#1A1F3A" fillOpacity="0.4" />
      <circle cx="128" cy="113" r="2.5" fill="#C9A96E" fillOpacity="0.35" />
      <circle cx="120" cy="130" r="2" fill="#1A1F3A" fillOpacity="0.3" />
      <circle cx="78" cy="130" r="2" fill="#C9A96E" fillOpacity="0.25" />

      {/* Traço de brilho no laço */}
      <path d="M91 67 C90 63 86 61 84 63" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── 3. IllustrationNotFound ────────────────────────────────────────────── */

export function IllustrationNotFound({ className = "" }: { className?: string }) {
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
      {/* Sombra */}
      <ellipse cx="100" cy="150" rx="50" ry="6" fill="#1A1F3A" fillOpacity="0.07" />

      {/* Fita esquerda — caindo */}
      <path
        d="M62 38 C57 54 46 66 52 82 C58 98 74 93 83 104 C92 115 89 130 81 140"
        stroke="#1A1F3A"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.75"
      />
      {/* Fita direita — caindo */}
      <path
        d="M138 38 C143 54 154 66 148 82 C142 98 126 93 117 104 C108 115 111 130 119 140"
        stroke="#1A1F3A"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.55"
      />

      {/* Alça esquerda solta */}
      <path
        d="M62 38 C52 20 74 10 82 22 C88 33 80 44 72 49"
        stroke="#1A1F3A"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.55"
      />
      {/* Alça direita solta */}
      <path
        d="M138 38 C148 20 126 10 118 22 C112 33 120 44 128 49"
        stroke="#1A1F3A"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.45"
      />

      {/* Nó desatado — círculo tracejado */}
      <circle
        cx="100"
        cy="80"
        r="16"
        fill="#FFF8F0"
        stroke="#C9A96E"
        strokeWidth="2"
        strokeDasharray="5 3"
      />
      {/* X no nó */}
      <line x1="93" y1="73" x2="107" y2="87" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="107" y1="73" x2="93" y2="87" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Pontinhos flutuantes — humor sutil */}
      <circle cx="40" cy="55" r="3" fill="#C9A96E" fillOpacity="0.25" />
      <circle cx="160" cy="50" r="2.5" fill="#1A1F3A" fillOpacity="0.15" />
      <circle cx="30" cy="90" r="2" fill="#C9A96E" fillOpacity="0.18" />
      <circle cx="170" cy="85" r="2" fill="#1A1F3A" fillOpacity="0.12" />
    </svg>
  );
}

/* ── 4. IllustrationCelebration ─────────────────────────────────────────── */

export function IllustrationCelebration({ className = "" }: { className?: string }) {
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
      {/* Sombra */}
      <ellipse cx="100" cy="149" rx="42" ry="6" fill="#1A1F3A" fillOpacity="0.07" />

      {/* ── Aliança ── */}
      <circle cx="100" cy="98" r="31" stroke="#C9A96E" strokeWidth="10" fill="none" strokeOpacity="0.85" />
      {/* Diamante */}
      <polygon points="100,54 91,67 100,71 109,67" fill="#1A1F3A" />
      <polygon points="100,54 109,67 100,79 91,67" fill="#1A1F3A" fillOpacity="0.6" />
      <line x1="91" y1="67" x2="109" y2="67" stroke="#1A1F3A" strokeOpacity="0.2" strokeWidth="1" />
      {/* Brilho diamante */}
      <line x1="97" y1="58" x2="94" y2="64" stroke="white" strokeOpacity="0.65" strokeWidth="1.2" strokeLinecap="round" />

      {/* ── Coração ── */}
      <path
        d="M100 44 C100 44 91 35 84 35 C77 35 72 41 72 47 C72 58 100 72 100 72 C100 72 128 58 128 47 C128 41 123 35 116 35 C109 35 100 44 100 44Z"
        fill="#C9A96E"
        fillOpacity="0.18"
        stroke="#C9A96E"
        strokeWidth="1.5"
        strokeOpacity="0.45"
      />

      {/* ── Confetti ── */}
      <rect x="34" y="28" width="9" height="5" rx="2" fill="#C9A96E" fillOpacity="0.75" transform="rotate(-22 34 28)" />
      <rect x="157" y="24" width="9" height="5" rx="2" fill="#1A1F3A" fillOpacity="0.6" transform="rotate(18 157 24)" />
      <rect x="58" y="16" width="7" height="4" rx="2" fill="#C9A96E" fillOpacity="0.5" transform="rotate(12 58 16)" />
      <rect x="132" y="17" width="7" height="4" rx="2" fill="#1A1F3A" fillOpacity="0.55" transform="rotate(-28 132 17)" />
      <rect x="42" y="54" width="8" height="4" rx="2" fill="#C9A96E" fillOpacity="0.6" transform="rotate(28 42 54)" />
      <rect x="150" y="57" width="8" height="4" rx="2" fill="#1A1F3A" fillOpacity="0.5" transform="rotate(-18 150 57)" />

      {/* Círculos confetti */}
      <circle cx="52" cy="36" r="4" fill="#C9A96E" fillOpacity="0.7" />
      <circle cx="148" cy="41" r="3.5" fill="#1A1F3A" fillOpacity="0.65" />
      <circle cx="73" cy="20" r="3" fill="#1A1F3A" fillOpacity="0.3" />
      <circle cx="127" cy="24" r="3" fill="#C9A96E" fillOpacity="0.5" />
      <circle cx="29" cy="65" r="2.5" fill="#1A1F3A" fillOpacity="0.45" />
      <circle cx="171" cy="68" r="2.5" fill="#C9A96E" fillOpacity="0.45" />

      {/* Serpentinas */}
      <path d="M33 18 C35 27 27 34 31 42" stroke="#C9A96E" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M167 18 C165 27 173 34 169 42" stroke="#1A1F3A" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M78 10 C80 17 74 23 78 30" stroke="#1A1F3A" strokeOpacity="0.28" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M122 10 C120 17 126 23 122 30" stroke="#C9A96E" strokeOpacity="0.38" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Estrelas */}
      <path d="M172 39 L173.5 43.5 L178 39 L173.5 34.5Z" fill="#C9A96E" fillOpacity="0.7" />
      <path d="M25 44 L26.5 48.5 L31 44 L26.5 39.5Z" fill="#1A1F3A" fillOpacity="0.6" />
    </svg>
  );
}

/* ── 5. IllustrationEmptyBudget ─────────────────────────────────────────── */

export function IllustrationEmptyBudget({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Orçamento vazio"
    >
      {/* Sombra */}
      <ellipse cx="100" cy="150" rx="60" ry="7" fill="#1A1F3A" fillOpacity="0.07" />

      {/* ── Moeda grande central ── */}
      <circle cx="100" cy="95" r="38" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1.5" strokeOpacity="0.25" />
      <circle cx="100" cy="95" r="32" fill="none" stroke="#1A1F3A" strokeWidth="1" strokeOpacity="0.12" />

      {/* Símbolo R$ */}
      <text
        x="100"
        y="103"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="28"
        fontWeight="bold"
        fill="#1A1F3A"
        fillOpacity="0.22"
      >
        R$
      </text>

      {/* ── Coração sobre a moeda ── */}
      <path
        d="M100 72 C100 72 93 64 87 64 C81 64 77 69 77 74 C77 83 100 94 100 94 C100 94 123 83 123 74 C123 69 119 64 113 64 C107 64 100 72 100 72Z"
        fill="#C9A96E"
        fillOpacity="0.22"
        stroke="#C9A96E"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />

      {/* ── Moedas menores à esquerda ── */}
      <circle cx="46" cy="110" r="20" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1.2" strokeOpacity="0.2" />
      <circle cx="46" cy="110" r="15" fill="none" stroke="#1A1F3A" strokeWidth="0.8" strokeOpacity="0.1" />
      <line x1="46" y1="102" x2="46" y2="118" stroke="#1A1F3A" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="106" x2="50" y2="106" stroke="#1A1F3A" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="42" y1="114" x2="50" y2="114" stroke="#1A1F3A" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round" />

      {/* ── Moedas menores à direita ── */}
      <circle cx="154" cy="110" r="20" fill="#FFF8F0" stroke="#1A1F3A" strokeWidth="1.2" strokeOpacity="0.2" />
      <circle cx="154" cy="110" r="15" fill="none" stroke="#1A1F3A" strokeWidth="0.8" strokeOpacity="0.1" />
      <line x1="154" y1="102" x2="154" y2="118" stroke="#1A1F3A" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="150" y1="106" x2="158" y2="106" stroke="#1A1F3A" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="150" y1="114" x2="158" y2="114" stroke="#1A1F3A" strokeOpacity="0.14" strokeWidth="1.2" strokeLinecap="round" />

      {/* Brilho na moeda central */}
      <path
        d="M76 76 C79 70 86 67 92 68"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Linha tracejada de "cifra" no topo */}
      <line x1="70" y1="32" x2="130" y2="32" stroke="#C9A96E" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="5 4" strokeLinecap="round" />
      <line x1="62" y1="44" x2="138" y2="44" stroke="#1A1F3A" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round" />

      {/* Pontos decorativos */}
      <circle cx="100" cy="22" r="3" fill="#C9A96E" fillOpacity="0.3" />
      <circle cx="88" cy="26" r="2" fill="#1A1F3A" fillOpacity="0.15" />
      <circle cx="112" cy="26" r="2" fill="#1A1F3A" fillOpacity="0.15" />
    </svg>
  );
}
