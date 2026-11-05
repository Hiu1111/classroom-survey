
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { getSurveyWithQuestions, countResponses } from '../lib/surveys'
import type { SurveyWithQuestions } from '../lib/types'

export default function PresentSurveyPage() {
  const { id } = useParams()
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [responseCount, setResponseCount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setError('Invalid survey ID.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const data = await getSurveyWithQuestions(id!)
        if (cancelled) return

        setSurvey(data)

        if (data.public_slug) {
          const link = `${window.location.origin}/s/${data.public_slug}`
          const image = await QRCode.toDataURL(link, {
            width: 360,
            margin: 2,
          })
          if (!cancelled) setQrCode(image)
        }

        const count = await countResponses(id!)
        if (!cancelled) setResponseCount(count)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load survey.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    const interval = window.setInterval(async () => {
      if (cancelled) return
      try {
        const count = await countResponses(id!)
        if (!cancelled) setResponseCount(count)
      } catch {
        // Keep the previous count if refreshing fails.
      }
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [id])

  const studentLink = survey?.public_slug
    ? `${window.location.origin}/s/${survey.public_slug}`
    : ''

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-10 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="text-blue-600">
          ← Back to Dashboard
        </Link>

        {loading && <p className="mt-8">Loading survey...</p>}

        {error && (
          <p role="alert" className="mt-6 rounded bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!loading && survey && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
            <h1 className="text-3xl font-bold">{survey.title}</h1>

            <p className="mt-3">
              Status: <strong>{survey.status.toUpperCase()}</strong>
            </p>

            {survey.status === 'active' && qrCode ? (
              <>
                <p className="mt-6 text-lg">
                  Scan the QR code to take this survey!
                </p>

                <img
                  src={qrCode}
                  alt="Survey QR Code"
                  className="mx-auto mt-4 w-72"
                />

                <a
                  href={studentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block break-all text-blue-600 underline"
                >
                  {studentLink}
                </a>

                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(studentLink)}
                  className="mt-4 rounded bg-blue-600 px-5 py-2 text-white"
                >
                  Copy Student Link
                </button>
              </>
            ) : (
              <p className="mt-6">
                Activate this survey to display its QR code and student link.
              </p>
            )}

            <div className="mt-8 rounded-xl bg-blue-50 p-6">
              <p className="text-gray-600">Responses Received</p>
              <p className="mt-2 text-5xl font-bold text-blue-700">
                {responseCount}
              </p>
            </div>

            <Link
              to={`/surveys/${survey.id}/results`}
              className="mt-6 inline-block rounded bg-gray-800 px-5 py-3 text-white"
            >
              View Results
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
