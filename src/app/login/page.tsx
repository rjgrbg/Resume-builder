'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Card, Alert } from '@/components/ui/card'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-ink-muted mt-1">Log in to continue building your resume.</p>
        </div>

        <Card className="p-6">
          <form action={action} className="flex flex-col gap-4">
            <Field label="Email">
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>

            <Field label="Password">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>

            {state?.error && <Alert>{state.error}</Alert>}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </Card>

        <p className="text-sm text-ink-muted mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-brand font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
