export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      {/* Document */}
      <path
        d="M10 8.5C10 7.67157 10.6716 7 11.5 7H17.5L22 11.5V23.5C22 24.3284 21.3284 25 20.5 25H11.5C10.6716 25 10 24.3284 10 23.5V8.5Z"
        fill="var(--brand-ink)"
        fillOpacity="0.95"
      />
      <path d="M17.5 7V11.5H22" fill="var(--brand)" fillOpacity="0.35" />
      {/* Lines representing text */}
      <rect x="12.5" y="14.5" width="7" height="1.4" rx="0.7" fill="var(--brand)" />
      <rect x="12.5" y="17.5" width="7" height="1.4" rx="0.7" fill="var(--brand)" />
      <rect x="12.5" y="20.5" width="4.5" height="1.4" rx="0.7" fill="var(--brand)" />
    </svg>
  )
}

export function Logo({
  className = '',
  markClassName = 'h-8 w-8',
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="font-semibold tracking-tight text-ink leading-none">
        Resume<span className="text-brand">AI</span>
      </span>
    </span>
  )
}
