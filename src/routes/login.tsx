import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toAppError } from '#/application/errors'
import { useAuth } from '#/features/auth'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' && search.redirect.startsWith('/') ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [userNameOrEmail, setUserNameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectPath = (Route.useSearch() as LoginSearch).redirect ?? '/'

  useEffect(() => {
    if (auth.phase === 'ready' && auth.isAuthenticated) {
      navigate({ to: redirectPath, replace: true })
    }
  }, [auth.isAuthenticated, auth.phase, navigate, redirectPath])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await auth.login({ userNameOrEmail, password })
      navigate({ to: redirectPath, replace: true })
    } catch (error) {
      const appError = toAppError(error)
      setErrorMessage(
        appError.code === 'UNAUTHORIZED'
          ? 'Invalid credentials. Use your AutoApp admin account.'
          : appError.message,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap flex min-h-[calc(100vh-8rem)] items-center px-4 py-10">
      <section className="grid w-full gap-8 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_22px_70px_rgba(10,16,24,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(31,123,215,0.26),transparent_66%)]" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(15,140,109,0.2),transparent_66%)]" />
          <p className="island-kicker mb-4">Secure access</p>
          <h1 className="display-title max-w-xl text-4xl font-bold leading-[1.02] text-[var(--sea-ink)] sm:text-5xl">
            Sign in to the AutoApp admin workspace.
          </h1>
          <p className="mt-4 max-w-lg text-base text-[var(--sea-ink-soft)] sm:text-lg">
            Manage inventory, brands, countries, and features from one protected dealership console.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-[var(--sea-ink-soft)] sm:max-w-md sm:grid-cols-2">
            {['JWT-backed sessions', 'Refresh token recovery', 'Protected catalog routes', 'Single sign-out'].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--surface-strong)] p-8 sm:p-10 lg:border-l lg:border-t-0">
          <div className="max-w-md">
            <p className="island-kicker mb-3">Authentication</p>
            <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)]">Welcome back</h2>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              Use your backend-backed admin credentials to continue.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--sea-ink)]">Username or email</span>
                <input
                  value={userNameOrEmail}
                  onChange={(event) => setUserNameOrEmail(event.target.value)}
                  autoComplete="username"
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--chip-line)]"
                  placeholder="admin"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--sea-ink)]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--chip-line)]"
                  placeholder="••••••••••••••••"
                />
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-[rgba(196,72,72,0.3)] bg-[rgba(196,72,72,0.1)] px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
