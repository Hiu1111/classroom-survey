import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context.tsx'
import { Button, buttonClass } from './ui.tsx'

export function InstructorHeader({ action }: { action?: React.ReactNode }) {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-600">Classroom Survey</p>
          <p className="text-sm text-slate-800">
            Signed in as <span className="font-semibold">{session?.user.email}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {action}
          <Link className={buttonClass('secondary')} to="/dashboard">
            Dashboard
          </Link>
          <Button
            onClick={() => {
              void signOut().then(() => navigate('/'))
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
