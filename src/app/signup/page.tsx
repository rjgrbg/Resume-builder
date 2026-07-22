'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signup } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Card, Alert } from '@/components/ui/card'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-ink-muted mt-1">
            Start building an ATS-optimized resume in minutes.
          </p>
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
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <p className="text-xs text-ink-subtle -mt-2">At least 8 characters.</p>

            {state?.error && <Alert>{state.error}</Alert>}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Creating account…' : 'Sign up'}
            </Button>
          </form>
        </Card>

        <p className="text-sm text-ink-muted mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
