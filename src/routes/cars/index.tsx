import { Link, createFileRoute, useSearch } from '@tanstack/react-router';
import { useCarSearch } from '#/hooks';

interface CarsSearchParams {
  page?: number;
}

export const Route = createFileRoute('/cars/')({
  validateSearch: (search: Record<string, unknown>): CarsSearchParams => ({
    page: typeof search.page === 'number' ? search.page : 1,
  }),
  component: CarsListPage,
});

function CarsListPage() {
  const { page = 1 } = useSearch({ from: Route.id });
  const pageSize = 10;

  const carsQuery = useCarSearch({
    query: { page, pageSize },
    filters: {},
    sorting: {},
  });

  return (
    <div className="page-wrap px-4 py-10">
      <section className="hero-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="island-kicker">Catalog</p>
            <h1 className="display-title mt-2 text-3xl font-bold">Cars</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
              Browse and manage all vehicles in the catalog.
            </p>
          </div>
          <Link
            to="/cars/create"
            className="rounded-full bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white no-underline shadow-[0_10px_24px_rgba(10,16,24,0.28)]"
          >
            Add Car
          </Link>
        </div>

        {carsQuery.isLoading ? (
          <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">Loading cars...</p>
        ) : carsQuery.isError ? (
          <p className="mt-6 text-sm text-red-600">Failed to load cars.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(carsQuery.data?.items ?? []).map((car) => (
              <article
                key={car.id}
                className="inventory-panel rounded-2xl p-4"
              >
                {car.mainPhotoUrl ? (
                  <div className="mb-3 h-32 overflow-hidden rounded-xl bg-[var(--line)]">
                    <img
                      src={car.mainPhotoUrl}
                      alt="Car"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[var(--line)] px-4 text-center text-sm text-[var(--sea-ink-soft)]">
                    No photo uploaded yet.
                  </div>
                )}
                <p className="island-kicker mb-2">Vehicle</p>
                <p className="text-sm text-[var(--sea-ink-soft)]">{car.year}</p>
                <h1 className="display-title mt-2 text-3xl font-bold">
                  {car.brandName} {car.model}
                </h1>
                <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
                  ${car.price.toLocaleString()}
                </h2>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  {car.mileage.toLocaleString()} kms
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/cars/$carId"
                    params={{ carId: car.id }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!carsQuery.isLoading && !carsQuery.isError ? (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Total cars: {carsQuery.data?.totalCount ?? 0}
            </p>
            <div className="flex flex-wrap gap-2">
              {page > 1 ? (
                <Link
                  to="/cars"
                  search={{ page: page - 1 }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
                >
                  ← Previous
                </Link>
              ) : null}
              <span className="flex items-center px-3 py-2 text-sm text-[var(--sea-ink-soft)]">
                Page {page} of {Math.ceil((carsQuery.data?.totalCount ?? 0) / pageSize)}
              </span>
              {(carsQuery.data?.totalCount ?? 0) > page * pageSize ? (
                <Link
                  to="/cars"
                  search={{ page: page + 1 }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
                >
                  Next →
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
