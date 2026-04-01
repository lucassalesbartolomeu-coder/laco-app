// ─── Brasão SVG Component ─────────────────────────────────────────────────────
// Circular monogram with textPath arcs — matches the prototype exactly

interface BrasaoSVGProps {
  accent: string;
  topText?: string;
  bottomText?: string;
  size?: number;
  strokeWidth?: number;
}

export function BrasaoSVG({
  accent,
  topText = 'ANTÔNIA E',
  bottomText = 'BRUNO',
  size = 100,
  strokeWidth = 1,
}: BrasaoSVGProps) {
  const id = `brasao-${topText.replace(/\s/g, '')}-${bottomText.replace(/\s/g, '')}`;

  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <circle cx="100" cy="100" r="90" fill="none" stroke={accent} strokeWidth={strokeWidth} />
      <circle cx="100" cy="100" r="60" fill="none" stroke={accent} strokeWidth={strokeWidth * 0.6} />
      <line x1="38" y1="100" x2="162" y2="100" stroke={accent} strokeWidth={strokeWidth * 0.5} />
      <defs>
        <path id={`${id}-top`} d="M 26,100 a 74,74 0 0,1 148,0" />
        <path id={`${id}-bot`} d="M 174,100 a 74,74 0 0,1 -148,0" />
      </defs>
      <text
        fill={accent}
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: '12px',
          letterSpacing: '0.28em',
          fontWeight: 300,
        }}
      >
        <textPath href={`#${id}-top`} textAnchor="middle" startOffset="50%">
          {topText}
        </textPath>
      </text>
      <text
        fill={accent}
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: '12px',
          letterSpacing: '0.28em',
          fontWeight: 300,
        }}
      >
        <textPath href={`#${id}-bot`} textAnchor="middle" startOffset="50%">
          {bottomText}
        </textPath>
      </text>
    </svg>
  );
}

// ─── Toolkit Monogram — mini version for toolkit cards ────────────────────────
interface ToolkitMonoProps {
  monoStyle: string;
  accent: string;
  bg: string;
  size?: number;
}

export function ToolkitMono({ monoStyle, accent, size = 44 }: ToolkitMonoProps) {
  if (monoStyle === 'classic' || monoStyle === 'midnight') {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx="100" cy="100" r="88" fill="none" stroke={accent} strokeWidth="1.2" />
        <circle cx="100" cy="100" r="58" fill="none" stroke={accent} strokeWidth="0.7" />
        <line x1="40" y1="100" x2="160" y2="100" stroke={accent} strokeWidth="0.6" />
        <text
          x="100"
          y="107"
          textAnchor="middle"
          fill={accent}
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '22px',
            fontWeight: 300,
          }}
        >
          N+N
        </text>
      </svg>
    );
  }

  if (monoStyle === 'botanical') {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx="100" cy="100" r="88" fill="none" stroke={accent} strokeWidth="0.5" strokeDasharray="5,9" />
        <circle cx="100" cy="100" r="68" fill="none" stroke={accent} strokeWidth="0.8" />
        <text
          x="100" y="96" textAnchor="middle" fill={accent}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300 }}
        >N</text>
        <text
          x="100" y="112" textAnchor="middle" fill={accent}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '10px' }}
        >&amp;</text>
        <text
          x="100" y="132" textAnchor="middle" fill={accent}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 300 }}
        >N</text>
      </svg>
    );
  }

  if (monoStyle === 'terracota') {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx="100" cy="100" r="88" fill="none" stroke={accent} strokeWidth="0.7" />
        <text
          x="100" y="109" textAnchor="middle" fill={accent}
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 400, fontStyle: 'italic' }}
        >NM</text>
      </svg>
    );
  }

  if (monoStyle === 'lavanda') {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx="100" cy="100" r="88" fill="none" stroke={accent} strokeWidth="0.6" />
        <text
          x="100" y="109" textAnchor="middle" fill={accent}
          style={{ fontFamily: "'EB Garamond', serif", fontSize: '28px', fontWeight: 400, fontStyle: 'italic' }}
        >N T</text>
      </svg>
    );
  }

  return null;
}
