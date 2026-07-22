export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80 ? 'text-success bg-success-bg' : score >= 50 ? 'text-warning bg-warning-bg' : 'text-danger bg-danger-bg'

  return (
    <span className={`inline-flex items-center text-xs font-semibold rounded-full px-2 py-0.5 ${tone}`}>
      {score}
    </span>
  )
}

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const tone = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  const circumference = 2 * Math.PI * 26
  const offset = circumference * (1 - score / 100)

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16 shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke={tone}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {score}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-ink-subtle">ATS score out of 100</p>
      </div>
    </div>
  )
}
