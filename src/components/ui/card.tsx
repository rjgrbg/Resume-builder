export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-raised shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function Alert({
  tone = 'danger',
  children,
}: {
  tone?: 'danger' | 'success' | 'warning'
  children: React.ReactNode
}) {
  const toneClass = {
    danger: 'bg-danger-bg text-danger',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
  }[tone]

  return (
    <div role="alert" className={`rounded-lg px-3 py-2 text-sm font-medium ${toneClass}`}>
      {children}
    </div>
  )
}
