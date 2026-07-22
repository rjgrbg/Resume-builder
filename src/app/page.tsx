import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UploadResumeForm } from '@/components/upload-resume-form'
import { LandingPage } from '@/components/landing-page'
import { SiteHeader } from '@/components/site-header'
import { Card } from '@/components/ui/card'

const STATUS_META: Record<string, { label: string; tone: string }> = {
  uploaded: { label: 'Queued', tone: 'text-ink-subtle' },
  parsing: { label: 'Parsing…', tone: 'text-warning' },
  parsed: { label: 'Ready', tone: 'text-success' },
  parse_failed: { label: 'Needs review', tone: 'text-danger' },
}

const TIPS = [
  'Use numbers wherever possible — "grew revenue 30%" beats "helped grow revenue."',
  'List skills that match the exact keywords in job postings you\u2019re targeting.',
  'Keep section headings standard: Summary, Experience, Education, Skills.',
]

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data?.user) {
    return <LandingPage />
  }

  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, file_name, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader userEmail={data.user.email} />

      <div className="flex flex-1 flex-col items-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-6 pt-4">
            <h1 className="text-2xl font-semibold tracking-tight">Your resumes</h1>
            <p className="text-sm text-ink-muted mt-1">
              Upload a resume to get an ATS score and an AI-optimized rewrite.
            </p>
          </div>

          <Card className="p-6 mb-6">
            <UploadResumeForm />
          </Card>

          {(!resumes || resumes.length === 0) && (
            <Card className="p-5 mb-8 bg-success-bg border-transparent">
              <p className="text-sm font-semibold text-success mb-2">Tips for a high ATS score</p>
              <ul className="flex flex-col gap-1.5">
                {TIPS.map((tip) => (
                  <li key={tip} className="text-sm text-ink-muted flex gap-2">
                    <span className="text-success">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {!resumes || resumes.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-sm text-ink-muted">
                No resumes yet. Upload one above to get your first ATS score.
              </p>
            </Card>
          ) : (
            <>
              <h2 className="text-xs font-medium uppercase tracking-wide text-ink-subtle mb-3">
                {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
              </h2>
              <ul className="flex flex-col gap-2">
                {resumes.map((resume) => {
                  const meta = STATUS_META[resume.status] ?? {
                    label: resume.status,
                    tone: 'text-ink-subtle',
                  }
                  return (
                    <li key={resume.id}>
                      <Link href={`/resumes/${resume.id}`}>
                        <Card className="flex items-center justify-between px-4 py-3.5 hover:border-ink-subtle transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-muted text-sm font-medium">
                              📄
                            </div>
                            <span className="text-sm font-medium truncate">
                              {resume.file_name}
                            </span>
                          </div>
                          <span className={`text-xs font-medium shrink-0 ml-3 ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </Card>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
