import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { LoginRequestDto, LoginResponseDto } from '#/types'
import {
  clearAuthSession,
  getAuthSession,
  isAccessTokenExpired,
  subscribeAuthSession,
} from './auth-storage'
import { loginWithPassword, logoutCurrentSession, refreshStoredSession } from './auth-service'

type AuthPhase = 'booting' | 'ready'

interface AuthContextValue {
  phase: AuthPhase
  session: LoginResponseDto | null
  isAuthenticated: boolean
  userName: string | null
  roles: string[]
  login: (dto: LoginRequestDto) => Promise<LoginResponseDto>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeAuthSession, getAuthSession, getAuthSession)
  const [phase, setPhase] = useState<AuthPhase>('booting')

  useEffect(() => {
    let isActive = true

    async function bootstrapSession() {
      const currentSession = getAuthSession()

      if (currentSession && isAccessTokenExpired(currentSession)) {
        await refreshStoredSession()
      }

      if (isActive) {
        setPhase('ready')
      }
    }

    bootstrapSession().catch(() => {
      if (isActive) {
        clearAuthSession()
        setPhase('ready')
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      phase,
      session,
      isAuthenticated: phase === 'ready' && session !== null,
      userName: session?.userName ?? null,
      roles: session?.roles ?? [],
      login: loginWithPassword,
      logout: logoutCurrentSession,
    }),
    [phase, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
