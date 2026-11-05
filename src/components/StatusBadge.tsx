import type { SurveyStatus } from '../lib/types.ts'

const styles: Record<SurveyStatus, string> = {
  draft: 'border-slate-400 bg-slate-100 text-slate-800',
  active: 'border-green-800 bg-green-100 text-green-950',
  closed: 'border-amber-800 bg-amber-100 text-amber-950',
  archived: 'border-slate-500 bg-slate-200 text-slate-800',
}

const labels: Record<SurveyStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
  archived: 'Archived',
}

export function StatusBadge({ status }: { status: SurveyStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
