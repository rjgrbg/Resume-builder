import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResumeWorkspace } from '@/components/resume-workspace'
import { SiteHeader } from '@/components/site-header'
import type { ResumeDocument, EvaluationReport } from '@/lib/resume/types'

export default async function ResumePage({
  params,
}: {
  params: Promise<{ resumeId: string }>
}) {
  const { resumeId } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    redirect('/login')
  }

  const { data: resume } = await supabase
    .from('resumes')
    .select('id, file_name, status')
    .eq('id', resumeId)
    .eq('user_id', userData.user.id)
    .single()

  if (!resume) {
    notFound()
  }

  const { data: documents } = await supabase
    .from('resume_documents')
    .select('id, kind, content, evaluations(score, report)')
    .eq('resume_id', resumeId)
    .eq('user_id', userData.user.id)

  // Supabase/PostgREST may return the 1:1 `evaluations` join as either an
  // object or a single-item array depending on version; normalize it.
  function firstEvaluation(
    evaluations: { score: number; report: unknown } | { score: number; report: unknown }[] | null
  ) {
    if (!evaluations) return null
    return Array.isArray(evaluations) ? evaluations[0] ?? null : evaluations
  }

  const original = documents?.find((d) => d.kind === 'original')
  const enhanced = documents?.find((d) => d.kind === 'enhanced')

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader userEmail={userData.user.email} />
      <div className="flex flex-1 flex-col p-6">
        <div className="w-full max-w-3xl mx-auto">
        <ResumeWorkspace
          resumeId={resume.id}
          fileName={resume.file_name}
          status={resume.status}
          original={
            original
              ? {
                  id: original.id,
                  content: original.content as unknown as ResumeDocument,
                  evaluation: (() => {
                    const ev = firstEvaluation(original.evaluations)
                    return ev
                      ? { score: ev.score, report: ev.report as unknown as EvaluationReport }
                      : null
                  })(),
                }
              : null
          }
          enhanced={
            enhanced
              ? {
                  id: enhanced.id,
                  content: enhanced.content as unknown as ResumeDocument,
                  evaluation: (() => {
                    const ev = firstEvaluation(enhanced.evaluations)
                    return ev
                      ? { score: ev.score, report: ev.report as unknown as EvaluationReport }
                      : null
                  })(),
                }
              : null
          }
        />
        </div>
      </div>
    </div>
  )
}
