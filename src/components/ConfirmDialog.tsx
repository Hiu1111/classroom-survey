import { useEffect } from 'react'
import { Button } from './ui.tsx'

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  pendingLabel,
  tone = 'default',
  pending = false,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  pendingLabel: string
  tone?: 'default' | 'danger'
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pending, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-lg bg-white p-6 text-slate-900 shadow-xl"
      >
        <h2 id="confirm-title" className="text-xl font-semibold">
          {title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-slate-700">{body}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button onClick={onCancel} disabled={pending} autoFocus>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={pending}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
