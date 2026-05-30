import { API_BASE_URL } from '#/services/api-base'
import type { LoginRequestDto, LoginResponseDto, RefreshTokenRequestDto } from '#/types'
import {
  clearAuthSession,
  getAuthSession,
  isRefreshTokenExpired,
  setAuthSession,
} from './auth-storage'

type AuthSession = LoginResponseDto

let refreshInFlight: Promise<AuthSession | null> | null = null

export async function loginWithPassword(dto: LoginRequestDto): Promise<AuthSession> {
  const session = await requestAuth<LoginResponseDto>('/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  })

  setAuthSession(session)
  return session
}

export async function refreshStoredSession(): Promise<AuthSession | null> {
  if (refreshInFlight) {
    return refreshInFlight
  }

  const session = getAuthSession()
  if (!session || isRefreshTokenExpired(session)) {
    clearAuthSession()
    return null
  }

  refreshInFlight = (async () => {
    try {
      const nextSession = await requestAuth<LoginResponseDto>('/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken } satisfies RefreshTokenRequestDto),
      })

      setAuthSession(nextSession)
      return nextSession
    } catch (error) {
      if (isUnauthorizedResponse(error)) {
        clearAuthSession()
        return null
      }

      throw error
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export async function logoutCurrentSession() {
  const session = getAuthSession()
  if (!session) {
    clearAuthSession()
    return
  }

  try {
    await requestAuth<void>('/logout', {
      method: 'POST',
      accessToken: session.accessToken,
    })
  } catch {
    // Clear local state even if the network call fails.
  }

  clearAuthSession()
}

async function requestAuth<T>(
  endpoint: string,
  options: { method: 'GET' | 'POST'; body?: string; accessToken?: string },
): Promise<T> {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}/auth${endpoint}`, {
    method: options.method,
    headers,
    body: options.body,
  })

  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      payload = undefined
    }

    const message =
      typeof payload === 'object' && payload !== null && 'title' in payload
        ? String((payload as Record<string, unknown>).title)
        : `API error: ${response.statusText}`

    throw {
      name: 'ApiClientError',
      message,
      status: response.status,
      payload,
    } as const
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function isUnauthorizedResponse(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: number }).status === 401
  )
}
