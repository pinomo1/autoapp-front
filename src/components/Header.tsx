import { Link } from '@tanstack/react-router'
import { useAuth } from '#/features/auth'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const auth = useAuth()
  const isSignedIn = auth.phase === 'ready' && auth.isAuthenticated

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)]/95 px-4 backdrop-blur-xl">
      <nav className="page-wrap flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="no-underline">
            <span className="display-title text-lg font-bold tracking-tight text-[var(--sea-ink)] sm:text-xl">
              AutoApp
            </span>
          </Link>

          <div className="flex sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <div className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-2 text-sm font-semibold shadow-[0_10px_30px_rgba(10,16,24,0.06)] sm:flex sm:w-auto sm:flex-nowrap sm:items-center sm:gap-x-4 sm:gap-y-1 sm:rounded-full sm:px-4 sm:py-2.5">
            <Link
              to="/"
              className="nav-link justify-center rounded-full px-3 py-2 text-center sm:rounded-none sm:px-0 sm:py-0"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Home
            </Link>
            <Link
              to="/cars"
              className="nav-link justify-center rounded-full px-3 py-2 text-center sm:rounded-none sm:px-0 sm:py-0"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Cars
            </Link>
            <Link
              to="/brands"
              className="nav-link justify-center rounded-full px-3 py-2 text-center sm:rounded-none sm:px-0 sm:py-0"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Brands
            </Link>
            <Link
              to="/countries"
              className="nav-link justify-center rounded-full px-3 py-2 text-center sm:rounded-none sm:px-0 sm:py-0"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Countries
            </Link>
            <Link
              to="/features"
              className="nav-link justify-center rounded-full px-3 py-2 text-center sm:rounded-none sm:px-0 sm:py-0"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Features
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:ml-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--sea-ink-soft)]">
            {isSignedIn ? (
              <>
                <span className="font-semibold text-[var(--sea-ink)]">{auth.userName}</span>
                {auth.roles.length > 0 ? <span className="ml-2">{auth.roles.join(', ')}</span> : null}
              </>
            ) : (
              <span className="font-semibold text-[var(--sea-ink)]">Guest browsing</span>
            )}
          </div>
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => auth.logout()}
              className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
