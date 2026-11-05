function rawMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'Unexpected server error'
}

export function isMissingRpc(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String(error.code) : ''
  const message = 'message' in error ? String(error.message) : ''
  return (
    code === 'PGRST202' ||
    /could not find the function/i.test(message) ||
    /schema cache/i.test(message)
  )
}

export function friendlyError(error: unknown, audience: 'student' | 'instructor') {
  const raw = rawMessage(error)
  const lower = raw.toLowerCase()

  if (audience === 'student') {
    if (raw.includes('SURVEY_NOT_ACTIVE')) {
      return 'This survey is no longer accepting responses.'
    }
    if (raw.includes('DUPLICATE_RESPONSE')) {
      return 'You have already submitted a response to this survey.'
    }
    if (raw.includes('SURVEY_NOT_FOUND')) return 'Survey not found.'
    if (
      raw.includes('INVALID_QUESTION') ||
      raw.includes('INVALID_CHOICE') ||
      raw.includes('MISSING_REQUIRED_ANSWER')
    ) {
      return 'Please answer every question before submitting.'
    }
    if (raw === 'Responses are not available yet.') return raw
    if (lower.includes('fetch') || lower.includes('network')) {
      return 'Network error. Check your connection and try again.'
    }
    return 'Something went wrong. Please try again.'
  }

  if (error instanceof Error) {
    if (lower.includes('fetch') || lower.includes('network')) {
      return 'Network error. Check your connection and try again.'
    }
    if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
      return 'Email or password is incorrect.'
    }
    if (lower.includes('email not confirmed')) {
      return 'Confirm your email before logging in.'
    }
    if (lower.includes('jwt') || raw.includes('Authentication required')) {
      return 'Authentication required. Please log in again.'
    }
    return error.message
  }

  if (lower.includes('fetch') || lower.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }
  if (lower.includes('jwt') || raw.includes('Authentication required')) {
    return 'Authentication required. Please log in again.'
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Email or password is incorrect.'
  }
  if (raw.includes('Survey not found')) return 'Survey not found.'
  if (lower.includes('only_one_active') || lower.includes('duplicate key')) {
    return 'Another survey is already active. Close it and try again.'
  }
  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'You do not have permission to do that. Log in and try again.'
  }
  return 'Something went wrong. Please try again.'
}
