'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createResumeManually,
  enhanceResumeAction,
  saveResumeDocument,
  deleteResume,
} from '@/lib/resume/actions'
import type { EvaluationReport, ResumeDocument, ResumeDocumentKind } from '@/lib/resume/types'
import { ResumeEditor } from './resume-editor'
import { ScoreBadge, ScoreRing } from './score-badge'
import { EvaluationReportView } from './evaluation-report-view'
import { Button } from '@/components/ui/button'
import { Card, Alert } from '@/components/ui/card'

interface DocumentSlot {
  id: string
  content: ResumeDocument
  evaluation: { score: number; report: EvaluationReport } | null
}

interface Props {
  resumeId: string
  fileName: string
  status: string
  original: DocumentSlot | null
  enhanced: DocumentSlot | null
}

export function ResumeWorkspace({ resumeId, fileName, status, original, enhanced }: Props) {
  const [tab, setTab] = useState<ResumeDocumentKind>('original')
  const [draftOriginal, setDraftOriginal] = useState<ResumeDocument | null>(
    original?.content ?? null
  )
  const [draftEnhanced, setDraftEnhanced] = useState<ResumeDocument | null>(
    enhanced?.content ?? null
  )
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const activeSlot = tab === 'original' ? original : enhanced
  const draft = tab === 'original' ? draftOriginal : draftEnhanced
  const setDraft = tab === 'original' ? setDraftOriginal : setDraftEnhanced

  function handleSave() {
    if (!activeSlot || !draft) return
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveResumeDocument(activeSlot.id, draft)
      if (!result.ok) setError(result.error)
      else {
        setSaved(true)
        router.refresh()
      }
    })
  }

  function handleEnhance() {
    setError(null)
    startTransition(async () => {
      const result = await enhanceResumeAction(resumeId)
      if (!result.ok) setError(result.error)
      else {
        setTab('enhanced')
        router.refresh()
      }
    })
  }

  function handleCreateManually() {
    setError(null)
    startTransition(async () => {
      const result = await createResumeManually(resumeId)
      if (!result.ok) setError(result.error)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm('Delete this resume permanently? This cannot be undone.')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteResume(resumeId)
      if (!result.ok) setError(result.error)
      else router.push('/')
    })
  }

  if (status === 'parsing' || status === 'uploaded') {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-brand" />
        <p className="text-sm text-ink-muted">Parsing your resume…</p>
      </Card>
    )
  }

  if (status === 'parse_failed' && !original) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm font-medium text-ink mb-1">We couldn&apos;t read this file automatically</p>
        <p className="text-sm text-ink-muted mb-5">
          This can happen with scanned images or unusual formatting. You can start from a blank
          resume instead and fill it in yourself.
        </p>
        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}
        <Button onClick={handleCreateManually} disabled={pending}>
          {pending ? 'Creating…' : 'Start from scratch'}
        </Button>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0">
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            ← Back to resumes
          </Link>
          <h1 className="text-xl font-semibold tracking-tight truncate mt-0.5">{fileName}</h1>
        </div>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={pending}>
          Delete
        </Button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border">
        <TabButton active={tab === 'original'} onClick={() => setTab('original')}>
          Original {original?.evaluation && <ScoreBadge score={original.evaluation.score} />}
        </TabButton>
        <TabButton active={tab === 'enhanced'} onClick={() => setTab('enhanced')}>
          Enhanced {enhanced?.evaluation && <ScoreBadge score={enhanced.evaluation.score} />}
        </TabButton>
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {saved && !error && (
        <div className="mb-4">
          <Alert tone="success">Changes saved.</Alert>
        </div>
      )}

      {tab === 'enhanced' && !enhanced && (
        <Card className="p-10 text-center">
          <p className="text-sm font-medium mb-1">No enhanced version yet</p>
          <p className="text-sm text-ink-muted mb-5">
            Let AI rewrite this resume with stronger phrasing, keywords, and quantified
            achievements to improve its ATS score.
          </p>
          <Button onClick={handleEnhance} disabled={pending || !original}>
            {pending ? 'Enhancing…' : 'Generate enhanced resume'}
          </Button>
        </Card>
      )}

      {activeSlot && draft && (
        <div className="flex flex-col gap-6">
          <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
            {activeSlot.evaluation ? (
              <ScoreRing
                score={activeSlot.evaluation.score}
                label={tab === 'original' ? 'Original resume' : 'Enhanced resume'}
              />
            ) : (
              <span className="text-sm text-ink-muted">Evaluating…</span>
            )}
            <div className="flex gap-2">
              {tab === 'original' && (
                <Button variant="secondary" size="sm" onClick={handleEnhance} disabled={pending}>
                  {enhanced ? 'Re-generate enhanced' : 'Enhance with AI'}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`/resumes/${resumeId}/export/${tab}`, '_blank')}
              >
                Export PDF
              </Button>
              <Button size="sm" onClick={handleSave} disabled={pending}>
                {pending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <ResumeEditor value={draft} onChange={(v) => { setDraft(v); setSaved(false) }} />
          </Card>

          {activeSlot.evaluation && <EvaluationReportView report={activeSlot.evaluation.report} />}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-brand text-ink' : 'border-transparent text-ink-subtle hover:text-ink-muted'
      }`}
    >
      {children}
    </button>
  )
}
