
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getSurveyResults } from '../lib/surveys'
import type { SurveyResults } from '../lib/types'

function csvCell(value: unknown): string {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCSV(results: SurveyResults) {
  const headers = [
    'Response ID',
    'Submitted At',
    ...results.survey.questions.map((q) => q.question_text),
  ]

  const rows = results.responses.map((response) => {
    const values = results.survey.questions.map((question) => {
      const answer = results.answers.find(
        (a) =>
          a.response_id === response.id &&
          a.question_id === question.id
      )

      const choice = question.choices.find(
        (c) => c.id === answer?.choice_id
      )

      return choice?.choice_text ?? ''
    })

    return [response.id, response.submitted_at, ...values]
  })

  const content = [headers, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')

  const blob = new Blob(['\uFEFF', content], {
    type: 'text/csv;charset=utf-8',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `survey-results-${results.survey.id}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function ResultsPage() {
  const { id } = useParams()
  const [results, setResults] = useState<SurveyResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!id) {
      setError('Invalid survey ID.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await getSurveyResults(id)
      setResults(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load results.'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/dashboard" className="text-blue-600">
          ← Back to Dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Survey Results</h1>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
            >
              Refresh Results
            </button>

            <button
              type="button"
              onClick={() => results && downloadCSV(results)}
              disabled={!results}
              className="rounded bg-green-700 px-5 py-3 text-white disabled:opacity-50"
            >
              Download CSV
            </button>
          </div>
        </div>

        {loading && <p className="mt-6">Loading results...</p>}

        {error && (
          <p role="alert" className="mt-6 rounded bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {results && !loading && (
          <>
            <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold">
                {results.survey.title}
              </h2>

              <p className="mt-4 text-gray-600">
                Total Responses
              </p>

              <p className="mt-1 text-5xl font-bold text-blue-700">
                {results.response_count}
              </p>

              {results.response_count === 0 && (
                <p className="mt-4 text-gray-600">
                  No student responses yet. Share the survey link to collect answers.
                </p>
              )}
            </section>

            {results.questions.map((question, index) => (
              <section
                key={question.question_id}
                className="mt-6 rounded-xl bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold">
                  {index + 1}. {question.question_text}
                </h3>

                <p className="mt-2 text-gray-600">
                  {question.response_count} answered ·{' '}
                  {question.unanswered_count} unanswered
                </p>

                <div className="mt-5 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={question.choices.map((choice, i) => ({
                        name: `Choice ${i + 1}`,
                        count: choice.count,
                        fullName: choice.choice_text,
                      }))}
                      margin={{ top: 10, right: 15, bottom: 15, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        formatter={(value, _name, props) => [
                          `${value ?? 0} responses`,
                          String(props.payload?.fullName ?? 'Choice'),
                        ]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#2563eb"
                        name="Responses"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-3">
                  {question.choices.map((choice) => (
                    <div
                      key={choice.choice_id}
                      className="flex items-center justify-between gap-4 border-b pb-3"
                    >
                      <span>{choice.choice_text}</span>
                      <span className="shrink-0 font-semibold">
                        {choice.count} ({choice.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  )
}
