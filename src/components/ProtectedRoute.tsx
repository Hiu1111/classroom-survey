import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context.tsx'
import { LoadingState } from './ui.tsx'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingState message="Loading..." />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return children
}
