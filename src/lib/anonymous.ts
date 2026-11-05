const TOKEN_KEY = 'classroom-survey-anonymous-token'
const SUBMITTED_KEY = 'classroom-survey-submitted'

export function getAnonymousToken() {
  const existing = localStorage.getItem(TOKEN_KEY)
  if (existing) return existing
  const token = crypto.randomUUID()
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

function readSubmitted() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SUBMITTED_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is string => typeof value === 'string')
  } catch {
    return []
  }
}

export function hasSubmitted(surveyId: string) {
  return readSubmitted().includes(surveyId)
}

export function markSubmitted(surveyId: string) {
  const ids = readSubmitted()
  if (ids.includes(surveyId)) return
  ids.push(surveyId)
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(ids))
}
