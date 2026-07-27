import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UploadResumeForm } from '@/components/upload-resume-form'
import { LandingPage } from '@/components/landing-page'
import { SiteHeader } from '@/components/site-header'
import { DashboardBlobs } from '@/components/dashboard-blobs'
import { ScoreBadge } from '@/components/score-badge'
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

type EvaluationRow = { score: number } | { score: number }[] | null

function bestScore(evaluations: EvaluationRow): number | null {
  if (!evaluations) return null
  const list = Array.isArray(evaluations) ? evaluations : [evaluations]
  if (list.length === 0) return null
  return Math.max(...list.map((e) => e.score))
}

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data?.user) {
    return <LandingPage />
  }

  const { data: resumes } = await supabase
    .from('resumes')
    .select(
      'id, file_name, status, created_at, resume_documents(kind, evaluations(score))'
    )
    .order('created_at', { ascending: false })

  const resumeCount = resumes?.length ?? 0
  const readyCount = resumes?.filter((r) => r.status === 'parsed').length ?? 0
  const allScores =
    resumes?.flatMap((r) =>
      (r.resume_documents ?? []).map((d) => bestScore(d.evaluations)).filter((s) => s !== null)
    ) ?? []
  const topScore = allScores.length > 0 ? Math.max(...(allScores as number[])) : null

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader userEmail={data.user.email} />

      <div className="relative flex flex-1 flex-col items-center px-6 pb-6 overflow-hidden">
        <DashboardBlobs />

        <div className="w-full max-w-2xl">
          <div className="mb-8 pt-12 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
              AI Resume Builder
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Let&apos;s get you noticed.
            </h1>
            <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto sm:mx-0">
              Upload a resume to get an ATS score and an AI-optimized rewrite.
            </p>
          </div>

          {resumeCount > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="Resumes" value={String(resumeCount)} />
              <StatCard label="Ready" value={String(readyCount)} />
              <StatCard
                label="Best score"
                value={topScore !== null ? String(topScore) : '—'}
                accent={topScore !== null}
              />
            </div>
          )}

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
                  const score = Math.max(
                    ...([
                      -1,
                      ...(resume.resume_documents ?? []).map((d) => bestScore(d.evaluations) ?? -1),
                    ])
                  )
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
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {score >= 0 && <ScoreBadge score={score} />}
                            <span className={`text-xs font-medium ${meta.tone}`}>
                              {meta.label}
                            </span>
                          </div>
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

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Card className="p-4 text-center">
      <p
        className={`text-2xl font-semibold tracking-tight ${accent ? 'text-brand' : 'text-ink'}`}
      >
        {value}
      </p>
      <p className="text-xs text-ink-subtle mt-0.5">{label}</p>
    </Card>
  )
}
