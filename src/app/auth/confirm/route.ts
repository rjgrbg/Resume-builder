import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles the confirmation link Supabase emails after signup.
//
// @supabase/ssr defaults to the PKCE flow, so confirmation links normally
// arrive here as `?code=...` and must be exchanged for a session. The
// `token_hash` + `type` form (OTP flow) is also supported as a fallback in
// case any auth email template uses it (e.g. some recovery flows).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(next)
    }

    // Email clients (Gmail, Outlook, etc.) sometimes "prefetch" links before
    // the user clicks them, consuming the single-use PKCE code early. If
    // that already succeeded, the user will have a valid session even
    // though *this* exchange attempt fails — treat that as success too.
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      redirect(next)
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirect(next)
    }

    const { data } = await supabase.auth.getUser()
    if (data.user) {
      redirect(next)
    }
  }

  redirect('/login?error=confirmation-failed')
}
