import type { EvaluationReport } from '@/lib/resume/types'
import { Card } from '@/components/ui/card'

const STATUS_LABEL: Record<string, string> = {
  pass: 'Pass',
  partial: 'Needs work',
  fail: 'Fail',
}

const STATUS_DOT: Record<string, string> = {
  pass: 'bg-success',
  partial: 'bg-warning',
  fail: 'bg-danger',
}

const STATUS_TEXT: Record<string, string> = {
  pass: 'text-success',
  partial: 'text-warning',
  fail: 'text-danger',
}

export function EvaluationReportView({ report }: { report: EvaluationReport }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">ATS evaluation breakdown</h3>
      <div className="flex flex-col gap-2">
        {report.criteria.map((c) => (
          <Card key={c.id} className="px-4 py-3 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[c.status]}`} />
                <span className="text-sm font-medium truncate">{c.label}</span>
              </div>
              <span className={`text-xs font-semibold shrink-0 ${STATUS_TEXT[c.status]}`}>
                {STATUS_LABEL[c.status]} · {c.points}/{c.maxPoints}
              </span>
            </div>
            {c.suggestion && (
              <p className="text-xs text-ink-muted mt-1.5 pl-3.5">{c.suggestion}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
