/**
 * Decorative background shapes for the dashboard, echoing the landing
 * page's illustration language (soft brand-colored blobs + sparkle
 * accents) without competing with the actual content on top of it.
 */
export function DashboardBlobs() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] w-full"
      viewBox="0 0 1024 560"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="850" cy="40" rx="260" ry="220" fill="var(--success-bg)" opacity="0.7" />
      <ellipse cx="120" cy="180" rx="200" ry="160" fill="var(--success-bg)" opacity="0.5" />
      <g fill="var(--brand)" opacity="0.6">
        <path d="M960 220 l5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 12 -5 z" />
        <path d="M70 40 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" />
      </g>
    </svg>
  )
}
