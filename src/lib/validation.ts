import type { SurveyDraft } from './types.ts'

export interface QuestionErrors {
  text?: string
  choices?: string
  choiceTexts?: Record<string, string>
}

export interface SurveyFormErrors {
  title?: string
  form?: string
  questions: Record<string, QuestionErrors>
}

export function validateSurveyDraft(draft: SurveyDraft): SurveyFormErrors | null {
  const errors: SurveyFormErrors = { questions: {} }

  if (!draft.title.trim()) errors.title = 'Enter a survey title.'
  if (draft.questions.length === 0) errors.form = 'Add at least one question.'

  for (const question of draft.questions) {
    const questionErrors: QuestionErrors = {}
    if (!question.question_text.trim()) questionErrors.text = 'Enter the question text.'

    if (question.question_type === 'true_false') {
      const labels = question.choices.map((choice) => choice.choice_text.trim())
      if (labels.length !== 2 || labels[0] !== 'True' || labels[1] !== 'False') {
        questionErrors.choices = 'True / False questions need True and False choices.'
      }
    } else {
      const choiceTexts: Record<string, string> = {}
      for (const choice of question.choices) {
        if (!choice.choice_text.trim()) choiceTexts[choice.id] = 'Enter this choice.'
      }
      if (Object.keys(choiceTexts).length > 0) questionErrors.choiceTexts = choiceTexts
      const filled = question.choices.filter((choice) => choice.choice_text.trim())
      if (filled.length < 2) questionErrors.choices = 'Add at least two choices.'
    }

    if (questionErrors.text || questionErrors.choices || questionErrors.choiceTexts) {
      errors.questions[question.id] = questionErrors
    }
  }

  if (errors.title || errors.form || Object.keys(errors.questions).length > 0) return errors
  return null
}
