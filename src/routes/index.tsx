import { Link, createFileRoute } from '@tanstack/react-router';
import { useBrandSearch, useCarSearch, useCountrySearch, useFeatureSearch } from '#/hooks';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const brandsQuery = useBrandSearch({});
  const countriesQuery = useCountrySearch({});
  const featuresQuery = useFeatureSearch({});
  const carsQuery = useCarSearch({
    query: { page: 1, pageSize: 1 },
    filters: {},
    sorting: {},
  });

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="hero-panel dealer-grid rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(31,123,215,0.24),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(15,140,109,0.16),transparent_66%)]" />
        <p className="island-kicker mb-3">AutoApp Admin</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Manage inventory with a dealership-grade command center.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Keep cars, brands, countries, and features organized through a crisp,
          premium admin surface built for quick decisions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/cars"
            className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5"
          >
            Open Cars
          </Link>
          <Link
            to="/brands"
            className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5"
          >
            Open Brands
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Cars', carsQuery.data?.totalCount ?? 0],
          ['Brands', brandsQuery.data?.totalCount ?? 0],
          ['Countries', countriesQuery.data?.totalCount ?? 0],
          ['Features', featuresQuery.data?.totalCount ?? 0],
        ].map(([title, count], index) => (
          <article
            key={title}
            className="inventory-panel feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <p className="island-kicker mb-3">Overview</p>
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-3xl font-bold text-[var(--sea-ink)]">{count}</p>
          </article>
        ))}
      </section>

      <section className="metrics-panel mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Quick Links</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>Use the Catalog menu to jump into each resource.</li>
          <li>Create or edit records from the list pages.</li>
          <li>Keep the catalog clean by archiving stale entries promptly.</li>
        </ul>
      </section>
    </main>
  );
}
