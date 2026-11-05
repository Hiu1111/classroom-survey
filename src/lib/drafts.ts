import type { DraftChoice, DraftQuestion, SurveyDraft, SurveyWithQuestions } from './types.ts'

export function blankChoice(): DraftChoice {
  return { id: crypto.randomUUID(), choice_text: '' }
}

export function trueFalseChoices(): DraftChoice[] {
  return [
    { id: crypto.randomUUID(), choice_text: 'True' },
    { id: crypto.randomUUID(), choice_text: 'False' },
  ]
}

export function blankQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    question_text: '',
    question_type: 'multiple_choice',
    choices: [blankChoice(), blankChoice()],
  }
}

export function toDraft(survey: SurveyWithQuestions): SurveyDraft {
  return {
    id: survey.id,
    title: survey.title,
    description: survey.description ?? '',
    questions: survey.questions
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((question) => ({
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        choices: question.choices
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((choice) => ({ id: choice.id, choice_text: choice.choice_text })),
      })),
  }
}
