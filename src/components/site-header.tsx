import Link from 'next/link'
import { LogoMark } from '@/components/logo'
import { UserMenu } from '@/components/user-menu'
import { LinkButton } from '@/components/ui/button'

export function SiteHeader({ userEmail }: { userEmail?: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" className="shrink-0">
          <LogoMark className="h-9 w-9" />
        </Link>

        {userEmail ? (
          <UserMenu email={userEmail} />
        ) : (
          <div className="flex items-center gap-2">
            <LinkButton href="/login" variant="ghost" size="sm">
              Log in
            </LinkButton>
            <LinkButton href="/signup" size="sm">
              Sign up
            </LinkButton>
          </div>
        )}
      </div>
    </header>
  )
}
