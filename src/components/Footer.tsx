export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--header-bg)]/60 px-4 pb-14 pt-10 text-[var(--sea-ink-soft)] backdrop-blur-xl">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} AutoApp. All rights reserved.
        </p>
        <p className="island-kicker m-0">Dealership catalog admin</p>
      </div>
    </footer>
  )
}
