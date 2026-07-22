import { forwardRef } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-hover',
  secondary:
    'bg-surface-raised text-ink border border-border-strong hover:bg-surface hover:border-ink-subtle',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-raised',
  danger: 'text-danger hover:bg-danger-bg',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      suppressHydrationWarning
      {...props}
    />
  )
)
Button.displayName = 'Button'

interface LinkButtonProps extends React.ComponentProps<typeof Link> {
  variant?: Variant
  size?: Size
  className?: string
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  )
}
