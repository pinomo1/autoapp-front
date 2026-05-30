import { Link, createFileRoute } from '@tanstack/react-router';
import { useCountrySearch } from '#/hooks';
import { useAuth } from '#/features/auth';

export const Route = createFileRoute('/countries/')({
  component: CountriesListPage,
});

function CountriesListPage() {
  const auth = useAuth();
  const canMutate = auth.phase === 'ready' && auth.isAuthenticated;
  const countriesQuery = useCountrySearch({});

  return (
    <div className="page-wrap px-4 py-10">
      <section className="hero-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="island-kicker">Catalog</p>
            <h1 className="display-title mt-2 text-3xl font-bold">Countries</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
              Manage the countries available to brands.
            </p>
          </div>
          {canMutate ? (
            <Link
              to="/countries/create"
              className="block rounded-full text-[var(--sea-ink)] border border-[var(--line)] 
              px-4 py-2 font-semibold no-underline text-center"
            >
              Add Country
            </Link>
          ) : null}
        </div>

        {countriesQuery.isLoading ? (
          <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">Loading countries...</p>
        ) : countriesQuery.isError ? (
          <p className="mt-6 text-sm text-red-600">Failed to load countries.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(countriesQuery.data?.items ?? []).map((country) => (
              <article
                key={country.id}
                className="inventory-panel rounded-2xl p-4"
              >
                <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
                  {country.countryName}
                </h2>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  {country.countryCode}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/countries/$countryId"
                    params={{ countryId: country.id }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!countriesQuery.isLoading && !countriesQuery.isError ? (
          <p className="mt-5 text-sm text-[var(--sea-ink-soft)]">
            Total countries: {countriesQuery.data?.totalCount ?? 0}
          </p>
        ) : null}
      </section>
    </div>
  );
}
