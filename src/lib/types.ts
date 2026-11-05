export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived'
export type QuestionType = 'multiple_choice' | 'true_false'

export interface Survey {
  id: string
  title: string
  description: string | null
  status: SurveyStatus
  public_slug: string | null
  created_at: string
  updated_at: string
}

export interface Choice {
  id: string
  question_id: string
  choice_text: string
  position: number
}

export interface Question {
  id: string
  survey_id: string
  question_text: string
  question_type: QuestionType
  position: number
  choices: Choice[]
}

export interface SurveyWithQuestions extends Survey {
  questions: Question[]
}

export interface DraftChoice {
  id: string
  choice_text: string
}

export interface DraftQuestion {
  id: string
  question_text: string
  question_type: QuestionType
  choices: DraftChoice[]
}

export interface SurveyDraft {
  id?: string
  title: string
  description: string
  questions: DraftQuestion[]
}

export interface ResponseRecord {
  id: string
  survey_id: string
  anonymous_token: string | null
  submitted_at: string
}

export interface AnswerRecord {
  id: string
  response_id: string
  question_id: string
  choice_id: string | null
  text_answer: string | null
}

export interface ChoiceResult {
  choice_id: string
  choice_text: string
  count: number
  percentage: number
}

export interface QuestionResult {
  question_id: string
  question_text: string
  question_type: QuestionType
  response_count: number
  unanswered_count: number
  unanswered_percentage: number
  choices: ChoiceResult[]
}

export interface SurveyResults {
  survey: SurveyWithQuestions
  response_count: number
  questions: QuestionResult[]
  responses: ResponseRecord[]
  answers: AnswerRecord[]
}

export interface PublicChoice {
  id: string
  choice_text: string
  position: number
}

export interface PublicQuestion {
  id: string
  question_text: string
  question_type: QuestionType
  position: number
  choices: PublicChoice[]
}

export interface PublicSurvey {
  id: string
  title: string
  description: string | null
  questions: PublicQuestion[]
}

export type PublicSurveyLookup =
  | { status: 'active'; survey: PublicSurvey }
  | { status: 'closed' }
  | { status: 'not_found' }

export interface AnswerInput {
  question_id: string
  choice_id: string
}
