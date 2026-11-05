
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getSurveyWithQuestions, saveSurvey } from '../lib/surveys'
import type { DraftQuestion, QuestionType, SurveyDraft } from '../lib/types'

function newQuestion(type: QuestionType = 'multiple_choice'): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    question_text: '',
    question_type: type,
    choices: (type === 'true_false' ? ['True', 'False'] : ['', '']).map(
      (text) => ({
        id: crypto.randomUUID(),
        choice_text: text,
      })
    ),
  }
}

export default function SurveyEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)

  const [draft, setDraft] = useState<SurveyDraft>({
    title: '',
    description: '',
    questions: [newQuestion()],
  })
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    getSurveyWithQuestions(id)
      .then((survey) => {
        if (cancelled) return
        setDraft({
          id: survey.id,
          title: survey.title,
          description: survey.description ?? '',
          questions: survey.questions.map((question) => ({
            id: question.id,
            question_text: question.question_text,
            question_type: question.question_type,
            choices: question.choices.map((choice) => ({
              id: choice.id,
              choice_text: choice.choice_text,
            })),
          })),
        })
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
  }, [id])

  function updateQuestion(index: number, changes: Partial<DraftQuestion>) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, i) =>
        i === index ? { ...question, ...changes } : question
      ),
    }))
  }

  function changeQuestionType(index: number, type: QuestionType) {
    updateQuestion(index, {
      question_type: type,
      choices:
        type === 'true_false'
          ? ['True', 'False'].map((text) => ({
              id: crypto.randomUUID(),
              choice_text: text,
            }))
          : ['', ''].map((text) => ({
              id: crypto.randomUUID(),
              choice_text: text,
            })),
    })
  }

  function updateChoice(questionIndex: number, choiceIndex: number, text: string) {
    const question = draft.questions[questionIndex]
    updateQuestion(questionIndex, {
      choices: question.choices.map((choice, i) =>
        i === choiceIndex ? { ...choice, choice_text: text } : choice
      ),
    })
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await saveSurvey(draft)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save survey.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="p-8">Loading survey...</main>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="text-blue-600">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          {editing ? 'Edit Survey' : 'Create Survey'}
        </h1>

        {error && (
          <p role="alert" className="mt-5 rounded bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <label htmlFor="title" className="block font-semibold">
              Survey Title
            </label>
            <input
              id="title"
              required
              value={draft.title}
              onChange={(e) =>
                setDraft((current) => ({ ...current, title: e.target.value }))
              }
              placeholder="e.g. Week 5 Knowledge Check"
              className="mt-2 w-full rounded border p-3"
            />

            <label htmlFor="description" className="mt-5 block font-semibold">
              Description
            </label>
            <textarea
              id="description"
              value={draft.description}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="Optional instructions"
              rows={3}
              className="mt-2 w-full rounded border p-3"
            />
          </section>

          {draft.questions.map((question, index) => (
            <section key={question.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Question {index + 1}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      questions: current.questions.filter((_, i) => i !== index),
                    }))
                  }
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>

              <input
                required
                value={question.question_text}
                onChange={(e) =>
                  updateQuestion(index, { question_text: e.target.value })
                }
                placeholder="Enter your question"
                className="w-full rounded border p-3"
              />

              <label className="mt-5 block font-medium">Question Type</label>
              <select
                value={question.question_type}
                onChange={(e) =>
                  changeQuestionType(index, e.target.value as QuestionType)
                }
                className="mt-2 w-full rounded border p-3"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
              </select>

              <div className="mt-5 space-y-3">
                <p className="font-medium">Answer Choices</p>
                {question.choices.map((choice, choiceIndex) => (
                  <div key={choice.id} className="flex gap-2">
                    <input
                      required
                      disabled={question.question_type === 'true_false'}
                      value={choice.choice_text}
                      onChange={(e) =>
                        updateChoice(index, choiceIndex, e.target.value)
                      }
                      placeholder={`Choice ${choiceIndex + 1}`}
                      className="w-full rounded border p-3 disabled:bg-gray-100"
                    />

                    {question.question_type === 'multiple_choice' &&
                      question.choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(index, {
                              choices: question.choices.filter(
                                (_, i) => i !== choiceIndex
                              ),
                            })
                          }
                          className="rounded border px-3 text-red-600"
                        >
                          Remove
                        </button>
                      )}
                  </div>
                ))}
              </div>

              {question.question_type === 'multiple_choice' &&
                question.choices.length < 8 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(index, {
                        choices: [
                          ...question.choices,
                          { id: crypto.randomUUID(), choice_text: '' },
                        ],
                      })
                    }
                    className="mt-4 text-blue-600"
                  >
                    + Add Choice
                  </button>
                )}
            </section>
          ))}

          <button
            type="button"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                questions: [...current.questions, newQuestion()],
              }))
            }
            className="w-full rounded-lg border-2 border-dashed border-blue-400 p-4 font-semibold text-blue-600"
          >
            + Add Question
          </button>

          <button
            type="submit"
            disabled={saving || draft.questions.length === 0}
            className="w-full rounded-lg bg-blue-600 p-4 font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Survey'}
          </button>
        </form>
      </div>
    </main>
  )
}
