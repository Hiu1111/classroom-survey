
import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  getPublicSurvey,
  submitSurveyResponse,
} from '../lib/surveys'
import type {
  PublicSurveyLookup,
} from '../lib/types'

export default function StudentSurveyPage() {
  const { slug } = useParams()
  const [result, setResult] = useState<PublicSurveyLookup | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) {
      setError('Invalid survey link.')
      setLoading(false)
      return
    }

    let cancelled = false

    getPublicSurvey(slug)
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load survey.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!result || result.status !== 'active') return

    const survey = result.survey

    if (survey.questions.some((q) => !answers[q.id])) {
      setError('Please answer every question.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const storageKey = `survey-token-${survey.id}`
      let token = localStorage.getItem(storageKey)

      if (!token) {
        token = crypto.randomUUID() + crypto.randomUUID()
        localStorage.setItem(storageKey, token)
      }

      await submitSurveyResponse(
        survey.id,
        token,
        survey.questions.map((q) => ({
          question_id: q.id,
          choice_id: answers[q.id],
        }))
      )

      setSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed.'

      if (message.includes('DUPLICATE_RESPONSE')) {
        setSubmitted(true)
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-700">
            Classroom Survey
          </h1>
        </header>

        {loading && <p className="text-center">Loading survey...</p>}

        {error && (
          <p role="alert" className="mb-5 rounded bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {submitted && (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-bold text-green-700">
              Thank you!
            </h2>
            <p className="mt-3">Your response has been recorded.</p>
          </div>
        )}

        {!loading && !submitted && result?.status === 'not_found' && (
          <p className="text-center">Survey not found.</p>
        )}

        {!loading && !submitted && result?.status === 'closed' && (
          <p className="text-center">
            This survey is no longer accepting responses.
          </p>
        )}

        {!loading && !submitted && result?.status === 'active' && (
          <div className="rounded-xl bg-white p-6 shadow sm:p-8">
            <h2 className="text-3xl font-bold">
              {result.survey.title}
            </h2>

            {result.survey.description && (
              <p className="mt-2 text-gray-600">
                {result.survey.description}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              {result.survey.questions.map((question, index) => (
                <fieldset key={question.id}>
                  <legend className="mb-4 font-semibold">
                    {index + 1}. {question.question_text}
                  </legend>

                  <div className="space-y-3">
                    {question.choices.map((choice) => (
                      <label
                        key={choice.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={choice.id}
                          checked={answers[question.id] === choice.id}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: choice.id,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        <span>{choice.choice_text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 p-4 font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
