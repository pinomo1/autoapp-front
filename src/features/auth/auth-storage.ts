import type { LoginResponseDto } from '#/types'

const STORAGE_KEY = 'autoapp.auth.session'

let cachedSession: LoginResponseDto | null | undefined
const listeners = new Set<() => void>()

export function getAuthSession(): LoginResponseDto | null {
  if (cachedSession !== undefined) {
    return cachedSession
  }

  cachedSession = readSessionFromStorage()
  return cachedSession
}

export function setAuthSession(session: LoginResponseDto | null) {
  cachedSession = session
  writeSessionToStorage(session)
  notifyAuthSessionListeners()
}

export function clearAuthSession() {
  cachedSession = null
  writeSessionToStorage(null)
  notifyAuthSessionListeners()
}

export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isAccessTokenExpired(session: LoginResponseDto, skewMilliseconds = 30_000) {
  return isExpired(session.expiresAt, skewMilliseconds)
}

export function isRefreshTokenExpired(session: LoginResponseDto, skewMilliseconds = 30_000) {
  return isExpired(session.refreshTokenExpiresAt, skewMilliseconds)
}

function notifyAuthSessionListeners() {
  listeners.forEach((listener) => listener())
}

function readSessionFromStorage(): LoginResponseDto | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsed = JSON.parse(rawSession) as LoginResponseDto
    if (isSessionLike(parsed)) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

function writeSessionToStorage(session: LoginResponseDto | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

function isExpired(dateString: string, skewMilliseconds: number) {
  const expiresAt = Date.parse(dateString)
  if (Number.isNaN(expiresAt)) {
    return true
  }

  return Date.now() >= expiresAt - skewMilliseconds
}

function isSessionLike(value: unknown): value is LoginResponseDto {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.expiresAt === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.refreshTokenExpiresAt === 'string' &&
    typeof candidate.userName === 'string' &&
    Array.isArray(candidate.roles)
  )
}
