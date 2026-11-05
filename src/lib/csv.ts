import { escapeCsv } from './format.ts'
import type { SurveyResults } from './types.ts'

export function resultsToCsv(results: SurveyResults) {
  const questions = results.survey.questions.slice().sort((a, b) => a.position - b.position)
  const choiceText = new Map<string, string>()
  for (const question of questions) {
    for (const choice of question.choices) choiceText.set(choice.id, choice.choice_text)
  }

  const answersByResponse = new Map<string, Map<string, string>>()
  for (const answer of results.answers) {
    const byQuestion = answersByResponse.get(answer.response_id) ?? new Map<string, string>()
    const text =
      (answer.choice_id ? choiceText.get(answer.choice_id) : undefined) ||
      answer.text_answer ||
      ''
    byQuestion.set(answer.question_id, text)
    answersByResponse.set(answer.response_id, byQuestion)
  }

  const header = ['response_id', 'submitted_at', ...questions.map((question) => question.question_text)]
  const lines = [header.map((cell) => escapeCsv(cell)).join(',')]

  for (const response of results.responses) {
    const byQuestion = answersByResponse.get(response.id)
    const row = [
      response.id,
      response.submitted_at,
      ...questions.map((question) => byQuestion?.get(question.id) ?? ''),
    ]
    lines.push(row.map((cell) => escapeCsv(cell)).join(','))
  }

  return lines.join('\r\n')
}
