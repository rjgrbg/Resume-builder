import { forwardRef } from 'react'

const fieldClass =
  'w-full rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-subtle outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20'

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    // suppressHydrationWarning: browser extensions (e.g. LastPass, Dashlane)
    // inject attributes like `fdprocessedid` into inputs before React
    // hydrates, which otherwise triggers a harmless hydration warning.
    <input
      ref={ref}
      className={`${fieldClass} ${className}`}
      suppressHydrationWarning
      {...props}
    />
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea ref={ref} className={`${fieldClass} resize-none ${className}`} {...props} />
))
Textarea.displayName = 'Textarea'

export function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="text-xs font-medium text-ink-muted" {...props}>
      {children}
    </label>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
