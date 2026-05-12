import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)]/95 px-4 backdrop-blur-xl">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="no-underline">
            <span className="display-title text-lg font-bold tracking-tight text-[var(--sea-ink)] sm:text-xl">
              AutoApp
            </span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold shadow-[0_10px_30px_rgba(10,16,24,0.06)] sm:order-2 sm:w-auto sm:flex-nowrap sm:px-4 sm:py-2.5">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Home
            </Link>
            <Link
              to="/cars"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Cars
            </Link>
            <Link
              to="/brands"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Brands
            </Link>
            <Link
              to="/countries"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Countries
            </Link>
            <Link
              to="/features"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Features
            </Link>
          </div>

          <div className="flex items-center ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  )
}
