import Link from 'next/link'
import { LinkButton } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/site-header'
import { HeroIllustration } from '@/components/hero-illustration'

const STEPS = [
  {
    title: 'Upload your resume',
    body: 'Drop in your existing PDF or DOCX resume. No formatting or cleanup required.',
    icon: '↑',
  },
  {
    title: 'Get an ATS score',
    body: 'We analyze it against real ATS scoring criteria and show exactly what to fix.',
    icon: '◎',
  },
  {
    title: 'Let AI rewrite it',
    body: 'One click generates an ATS-optimized version with stronger phrasing and keywords.',
    icon: '✦',
  },
  {
    title: 'Edit, compare, export',
    body: 'Fine-tune either version yourself, compare scores side by side, and download a PDF.',
    icon: '↓',
  },
]

const FAQS = [
  {
    q: 'What file types can I upload?',
    a: 'PDF and DOCX, up to 10 MB. If a file can\u2019t be read automatically, you can start from a blank resume instead.',
  },
  {
    q: 'How is the ATS score calculated?',
    a: 'A deterministic set of rules checks contact completeness, section coverage, quantified achievements, skills, and more — the same score every time for the same content.',
  },
  {
    q: 'Is my resume data private?',
    a: 'Yes. Every resume, file, and score is scoped to your account with row-level security — no one else can access it.',
  },
]

export function LandingPage() {
  return (
    <div className="flex-1">
      <SiteHeader />

      <section className="px-6 pt-16 pb-20 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-4">
            AI Resume Builder
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Get past the ATS.
            <br />
            Get to the interview.
          </h1>
          <p className="text-base text-ink-muted mt-4 max-w-lg mx-auto lg:mx-0">
            Upload your resume, see exactly how it scores against Applicant Tracking Systems, and
            let AI rewrite it to maximize your chances of getting noticed.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-3 mt-8">
            <LinkButton href="/signup">Get started free</LinkButton>
            <LinkButton href="/login" variant="secondary">
              Log in
            </LinkButton>
          </div>
        </div>
        <div className="hidden lg:block">
          <HeroIllustration />
        </div>
      </section>

      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-brand font-semibold">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-subtle mb-0.5">Step {i + 1}</p>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-sm text-ink-muted mt-1">{step.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-center mb-6">Frequently asked questions</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="p-4">
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="text-sm text-ink-muted mt-1">{faq.a}</p>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-ink-muted mt-8">
          Ready to improve your resume?{' '}
          <Link href="/signup" className="text-brand font-medium hover:underline">
            Create a free account
          </Link>
        </p>
      </section>
    </div>
  )
}
