import { Card } from '@/components/ui/card'

export default function CheckEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success text-2xl">
          ✉
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-ink-muted mt-2">
          We sent you a confirmation link. Click it to activate your account, then log in.
        </p>
      </Card>
    </div>
  )
}
