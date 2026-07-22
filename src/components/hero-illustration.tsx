export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a resume document next to an ATS score card"
    >
      {/* Background blob */}
      <ellipse cx="240" cy="190" rx="220" ry="150" fill="var(--success-bg)" />

      {/* Resume document */}
      <g transform="translate(70,40)">
        <rect
          x="0"
          y="0"
          width="200"
          height="260"
          rx="10"
          fill="var(--surface-raised)"
          stroke="var(--border-strong)"
          strokeWidth="2"
        />
        <rect x="24" y="28" width="90" height="10" rx="5" fill="var(--ink)" />
        <rect x="24" y="46" width="60" height="6" rx="3" fill="var(--ink-subtle)" />

        <rect x="24" y="76" width="50" height="6" rx="3" fill="var(--brand)" />
        <rect x="24" y="90" width="152" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="24" y="100" width="152" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="24" y="110" width="110" height="5" rx="2.5" fill="var(--border-strong)" />

        <rect x="24" y="134" width="60" height="6" rx="3" fill="var(--brand)" />
        <rect x="24" y="148" width="152" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="24" y="158" width="152" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="24" y="168" width="120" height="5" rx="2.5" fill="var(--border-strong)" />

        <rect x="24" y="192" width="45" height="6" rx="3" fill="var(--brand)" />
        <rect x="24" y="206" width="40" height="16" rx="8" fill="var(--success-bg)" />
        <rect x="70" y="206" width="52" height="16" rx="8" fill="var(--success-bg)" />
        <rect x="128" y="206" width="36" height="16" rx="8" fill="var(--success-bg)" />
      </g>

      {/* Score card */}
      <g transform="translate(290,150)">
        <rect
          x="0"
          y="0"
          width="150"
          height="130"
          rx="14"
          fill="var(--surface-raised)"
          stroke="var(--border-strong)"
          strokeWidth="2"
        />
        <circle cx="45" cy="55" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="45"
          cy="55"
          r="32"
          fill="none"
          stroke="var(--success)"
          strokeWidth="8"
          strokeDasharray="201"
          strokeDashoffset="35"
          strokeLinecap="round"
          transform="rotate(-90 45 55)"
        />
        <text
          x="45"
          y="60"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="var(--ink)"
          fontFamily="Helvetica, Arial, sans-serif"
        >
          92
        </text>
        <rect x="90" y="30" width="45" height="7" rx="3.5" fill="var(--ink)" />
        <rect x="90" y="45" width="35" height="6" rx="3" fill="var(--ink-subtle)" />
        <rect x="16" y="98" width="118" height="6" rx="3" fill="var(--success)" />
      </g>

      {/* Sparkle accents */}
      <g fill="var(--brand)">
        <path d="M400 70 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" />
        <path d="M55 240 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" opacity="0.7" />
      </g>
    </svg>
  )
}
