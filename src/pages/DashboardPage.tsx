
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import {
  listSurveys,
  activateSurvey,
  closeSurvey,
  duplicateSurvey,
  archiveSurvey,
  deleteSurvey,
} from '../lib/surveys'
import type { Survey } from '../lib/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function loadSurveys() {
    try {
      setError('')
      const data = await listSurveys()
      setSurveys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load surveys.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSurveys()
  }, [])

  async function perform(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await action()
      await loadSurveys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classroom Survey</h1>
        <button
          onClick={async () => {
            try {
              await signOut()
              navigate('/login')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Sign out failed.')
            }
          }}
          className="text-blue-600"
        >
          Sign Out
        </button>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Instructor Dashboard</h2>
            <p className="mt-2 text-gray-500">
              Create and manage classroom surveys.
            </p>
          </div>

          <Link
            to="/surveys/new"
            className="rounded bg-blue-600 px-5 py-3 text-white"
          >
            + New Survey
          </Link>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading surveys...</p>
        ) : surveys.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-semibold">No surveys yet</h3>
            <p className="mt-2 text-gray-500">
              Create your first survey to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{survey.title}</h3>
                    <p className="mt-1 text-gray-500">
                      {survey.description || 'No description'}
                    </p>
                    <p className="mt-2 text-sm">
                      Status: <strong>{survey.status}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/surveys/${survey.id}/edit`}
                      className="rounded border px-3 py-2"
                    >
                      Edit
                    </Link>

                    <Link
                      to={`/surveys/${survey.id}/results`}
                      className="rounded border px-3 py-2"
                    >
                      Results
                    </Link>

                    {survey.status === 'active' && (
                      <>
                        <Link
                          to={`/surveys/${survey.id}/present`}
                          className="rounded border px-3 py-2"
                        >
                          Present
                        </Link>
                        <button
                          disabled={busy}
                          onClick={() => void perform(() => closeSurvey(survey.id))}
                          className="rounded bg-yellow-100 px-3 py-2 disabled:opacity-50"
                        >
                          Close
                        </button>
                      </>
                    )}

                    {(survey.status === 'draft' || survey.status === 'closed') && (
                      <button
                        disabled={busy}
                        onClick={() => void perform(() => activateSurvey(survey.id))}
                        className="rounded bg-green-100 px-3 py-2 disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}

                    <button
                      disabled={busy}
                      onClick={() => void perform(() => duplicateSurvey(survey.id))}
                      className="rounded border px-3 py-2 disabled:opacity-50"
                    >
                      Duplicate
                    </button>

                    {survey.status !== 'archived' && (
                      <button
                        disabled={busy}
                        onClick={() => void perform(() => archiveSurvey(survey.id))}
                        className="rounded border px-3 py-2 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}

                    <button
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('Delete this survey permanently?')) {
                          void perform(() => deleteSurvey(survey.id))
                        }
                      }}
                      className="rounded bg-red-100 px-3 py-2 text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
