'use client'

import { useEffect, useRef, useState } from 'react'
import { logout } from '@/lib/auth/actions'

export function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initial = email.trim().charAt(0).toUpperCase() || '?'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-ink text-sm font-semibold hover:opacity-90 transition-opacity"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface-raised shadow-md py-1 z-10">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-ink-subtle">Signed in as</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger-bg transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
