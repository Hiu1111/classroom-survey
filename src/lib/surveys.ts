
import { isSupabaseConfigured, supabase } from './supabase.ts'
import type {
  AnswerInput,
  AnswerRecord,
  PublicQuestion,
  PublicSurvey,
  PublicSurveyLookup,
  Question,
  QuestionResult,
  ResponseRecord,
  Survey,
  SurveyDraft,
  SurveyResults,
  SurveyWithQuestions,
} from './types.ts'
import { validateSurveyDraft } from './validation.ts'

const surveyColumns =
  'id, title, description, status, public_slug, created_at, updated_at'

const nestedSurveySelect = `
  ${surveyColumns},
  questions (
    id, survey_id, question_text, question_type, position,
    choices ( id, question_id, choice_text, position )
  )
`

function requireClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }
}

function sortSurvey(survey: SurveyWithQuestions): SurveyWithQuestions {
  return {
    ...survey,
    questions: (survey.questions ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((question) => ({
        ...question,
        choices: (question.choices ?? [])
          .slice()
          .sort((a, b) => a.position - b.position),
      })),
  }
}

export async function listSurveys() {
  requireClient()

  const { data, error } = await supabase
    .from('surveys')
    .select(surveyColumns)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as Survey[]
}

export async function getSurveyWithQuestions(id: string) {
  requireClient()

  const { data, error } = await supabase
    .from('surveys')
    .select(nestedSurveySelect)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Survey not found.')

  return sortSurvey(data as SurveyWithQuestions)
}

export async function countResponses(surveyId: string) {
  requireClient()

  const { count, error } = await supabase
    .from('responses')
    .select('id', { count: 'exact', head: true })
    .eq('survey_id', surveyId)

  if (error) throw error

  return count ?? 0
}

export async function saveSurvey(draft: SurveyDraft) {
  requireClient()

  const validation = validateSurveyDraft(draft)

  if (validation) {
    throw new Error('Fix the highlighted fields before saving.')
  }

  let surveyId = draft.id

  if (!surveyId) {
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: 'draft',
      })
      .select(surveyColumns)
      .single()

    if (error) throw error

    surveyId = (data as Survey).id
  } else {
    const existing = await getSurveyWithQuestions(surveyId)

    if (existing.status === 'active') {
      throw new Error('Close the survey before editing it.')
    }

    if (existing.status === 'archived') {
      throw new Error('Archived surveys cannot be edited.')
    }

    const { error } = await supabase
      .from('surveys')
      .update({
        title: draft.title.trim(),
        description: draft.description.trim() || null,
      })
      .eq('id', surveyId)

    if (error) throw error
  }

  const { data: existingQuestions, error: questionReadError } =
    await supabase
      .from('questions')
      .select('id')
      .eq('survey_id', surveyId)

  if (questionReadError) throw questionReadError

  const keepQuestionIds = new Set(
    draft.questions.map((question) => question.id)
  )

  const removeQuestionIds = (
    (existingQuestions ?? []) as { id: string }[]
  )
    .map((question) => question.id)
    .filter((id) => !keepQuestionIds.has(id))

  if (removeQuestionIds.length > 0) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .in('id', removeQuestionIds)

    if (error) throw error
  }

  const { error: questionWriteError } = await supabase
    .from('questions')
    .upsert(
      draft.questions.map((question, index) => ({
        id: question.id,
        survey_id: surveyId,
        question_text: question.question_text.trim(),
        question_type: question.question_type,
        position: index + 1,
      })),
      { onConflict: 'id' }
    )

  if (questionWriteError) throw questionWriteError

  const questionIds = draft.questions.map((question) => question.id)

  const { data: existingChoices, error: choiceReadError } =
    await supabase
      .from('choices')
      .select('id')
      .in('question_id', questionIds)

  if (choiceReadError) throw choiceReadError

  const keepChoiceIds = new Set(
    draft.questions.flatMap((question) =>
      question.choices.map((choice) => choice.id)
    )
  )

  const removeChoiceIds = (
    (existingChoices ?? []) as { id: string }[]
  )
    .map((choice) => choice.id)
    .filter((id) => !keepChoiceIds.has(id))

  if (removeChoiceIds.length > 0) {
    const { error } = await supabase
      .from('choices')
      .delete()
      .in('id', removeChoiceIds)

    if (error) throw error
  }

  const { error: choiceWriteError } = await supabase
    .from('choices')
    .upsert(
      draft.questions.flatMap((question) =>
        question.choices.map((choice, index) => ({
          id: choice.id,
          question_id: question.id,
          choice_text: choice.choice_text.trim(),
          position: index + 1,
        }))
      ),
      { onConflict: 'id' }
    )

  if (choiceWriteError) throw choiceWriteError

  return getSurveyWithQuestions(surveyId)
}

export async function duplicateSurvey(id: string) {
  const survey = await getSurveyWithQuestions(id)

  const copy = await saveSurvey({
    title: `Copy of ${survey.title}`,
    description: survey.description ?? '',
    questions: survey.questions.map((question) => ({
      id: crypto.randomUUID(),
      question_text: question.question_text,
      question_type: question.question_type,
      choices: question.choices.map((choice) => ({
        id: crypto.randomUUID(),
        choice_text: choice.choice_text,
      })),
    })),
  })

  return copy.id
}

export async function activateSurvey(id: string) {
  requireClient()

  const survey = await getSurveyWithQuestions(id)

  const validation = validateSurveyDraft({
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

  if (validation) {
    throw new Error(
      'Add a title, at least one question, and answer choices before activating.'
    )
  }

  const { data, error } = await supabase.rpc('activate_survey', {
    p_survey_id: id,
  })

  if (error) throw error

  return data as {
    id: string
    status: string
    public_slug: string
  }
}

export async function closeSurvey(id: string) {
  requireClient()

  const { error } = await supabase.rpc('close_survey', {
    p_survey_id: id,
  })

  if (error) throw error
}

export async function archiveSurvey(id: string) {
  requireClient()

  const { data, error } = await supabase
    .from('surveys')
    .update({ status: 'archived' })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Survey not found.')
}

export async function deleteSurvey(id: string) {
  requireClient()

  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', id)

  if (error) throw error
}

function percent(count: number, total: number) {
  if (total === 0) return 0

  return Math.round((count / total) * 1000) / 10
}

export async function getSurveyResults(
  surveyId: string
): Promise<SurveyResults> {
  const survey = await getSurveyWithQuestions(surveyId)

  const { data: responseData, error } = await supabase
    .from('responses')
    .select('id, survey_id, anonymous_token, submitted_at')
    .eq('survey_id', surveyId)
    .order('submitted_at', { ascending: true })

  if (error) throw error

  const responses = (responseData ?? []) as ResponseRecord[]
  const answers: AnswerRecord[] = []

  const ids = responses.map((response) => response.id)

  for (let index = 0; index < ids.length; index += 100) {
    const chunk = ids.slice(index, index + 100)

    const { data, error: answerError } = await supabase
      .from('answers')
      .select('id, response_id, question_id, choice_id, text_answer')
      .in('response_id', chunk)

    if (answerError) throw answerError

    answers.push(...((data ?? []) as AnswerRecord[]))
  }

  const questions: QuestionResult[] = survey.questions.map(
    (question: Question) => {
      const questionAnswers = answers.filter(
        (answer) => answer.question_id === question.id
      )

      const counts = new Map<string, number>()

      for (const answer of questionAnswers) {
        if (!answer.choice_id) continue

        counts.set(
          answer.choice_id,
          (counts.get(answer.choice_id) ?? 0) + 1
        )
      }

      const answered = questionAnswers.filter(
        (answer) => answer.choice_id
      ).length

      const unanswered = Math.max(
        responses.length - answered,
        0
      )

      return {
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        response_count: answered,
        unanswered_count: unanswered,
        unanswered_percentage: percent(
          unanswered,
          responses.length
        ),
        choices: question.choices.map((choice) => ({
          choice_id: choice.id,
          choice_text: choice.choice_text,
          count: counts.get(choice.id) ?? 0,
          percentage: percent(
            counts.get(choice.id) ?? 0,
            responses.length
          ),
        })),
      }
    }
  )

  return {
    survey,
    response_count: responses.length,
    questions,
    responses,
    answers,
  }
}

interface PublicPayload {
  status?: string
  survey?: {
    id: string
    title: string
    description: string | null
  }
  questions?: PublicQuestion[]
}

function asPublicSurvey(payload: PublicPayload): PublicSurvey {
  const questions = (payload.questions ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((question) => ({
      ...question,
      choices: (question.choices ?? [])
        .slice()
        .sort((a, b) => a.position - b.position),
    }))

  return {
    id: payload.survey?.id ?? '',
    title: payload.survey?.title ?? '',
    description: payload.survey?.description ?? null,
    questions,
  }
}

export async function getPublicSurvey(
  slug: string
): Promise<PublicSurveyLookup> {
  requireClient()

  const { data, error } = await supabase.rpc(
    'get_public_survey',
    { p_slug: slug }
  )

  if (error) throw error

  const payload = (data ?? {}) as PublicPayload

  if (payload.status === 'active' && payload.survey) {
    return {
      status: 'active',
      survey: asPublicSurvey(payload),
    }
  }

  if (payload.status === 'closed') {
    return { status: 'closed' }
  }

  return { status: 'not_found' }
}

export async function submitSurveyResponse(
  surveyId: string,
  token: string,
  answers: AnswerInput[],
) {
  requireClient()

  const { data, error } = await supabase.rpc(
    'submit_survey_response',
    {
      p_survey_id: surveyId,
      p_anonymous_token: token,
      p_answers: answers,
    }
  )

  if (error) throw error

  return data as {
    success: boolean
    response_id: string
  }
}
