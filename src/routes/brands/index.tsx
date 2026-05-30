import { Link, createFileRoute } from '@tanstack/react-router';
import { useBrandSearch } from '#/hooks';
import { useAuth } from '#/features/auth';

export const Route = createFileRoute('/brands/')({
  component: BrandsListPage,
});

function BrandsListPage() {
  const auth = useAuth();
  const canMutate = auth.phase === 'ready' && auth.isAuthenticated;
  const brandsQuery = useBrandSearch({});

  return (
    <div className="page-wrap px-4 py-10">
      <section className="hero-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="island-kicker">Catalog</p>
            <h1 className="display-title mt-2 text-3xl font-bold">Brands</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
              Manage automotive brands in the catalog.
            </p>
          </div>
          {canMutate ? (
            <Link
              to="/brands/create"
              className="block rounded-full text-[var(--sea-ink)] border border-[var(--line)] 
              px-4 py-2 font-semibold no-underline text-center"
            >
              Add Brand
            </Link>
          ) : null}
        </div>

        {brandsQuery.isLoading ? (
          <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">Loading brands...</p>
        ) : brandsQuery.isError ? (
          <p className="mt-6 text-sm text-red-600">Failed to load brands.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(brandsQuery.data?.items ?? []).map((brand) => (
              <article
                key={brand.id}
                className="inventory-panel rounded-2xl p-4"
              >
                <div className="mb-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={`${brand.brandName} logo`}
                      className="h-40 w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-[var(--sea-ink-soft)]">
                      No logo uploaded yet.
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
                  {brand.brandName}
                </h2>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{brand.countryName}</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/brands/$brandId"
                    params={{ brandId: brand.id }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!brandsQuery.isLoading && !brandsQuery.isError ? (
          <p className="mt-5 text-sm text-[var(--sea-ink-soft)]">
            Total brands: {brandsQuery.data?.totalCount ?? 0}
          </p>
        ) : null}
      </section>
    </div>
  );
}
