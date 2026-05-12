import { Link, createFileRoute } from '@tanstack/react-router';
import { useFeatureSearch } from '#/hooks';

export const Route = createFileRoute('/features/')({
  component: FeaturesListPage,
});

function FeaturesListPage() {
  const featuresQuery = useFeatureSearch({});

  return (
    <div className="page-wrap px-4 py-10">
      <section className="hero-panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="island-kicker">Catalog</p>
            <h1 className="display-title mt-2 text-3xl font-bold">Features</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
              Manage the feature tags that can be attached to cars.
            </p>
          </div>
          <Link
            to="/features/create"
            className="rounded-full bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white no-underline shadow-[0_10px_24px_rgba(10,16,24,0.28)]"
          >
            Add Feature
          </Link>
        </div>

        {featuresQuery.isLoading ? (
          <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">Loading features...</p>
        ) : featuresQuery.isError ? (
          <p className="mt-6 text-sm text-red-600">Failed to load features.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(featuresQuery.data?.items ?? []).map((feature) => (
              <article
                key={feature.id}
                className="inventory-panel rounded-2xl p-4"
              >
                <p className="island-kicker mb-3">Tag</p>
                <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
                  {feature.featureName}
                </h2>
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/features/$featureId"
                    params={{ featureId: feature.id }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!featuresQuery.isLoading && !featuresQuery.isError ? (
          <p className="mt-5 text-sm text-[var(--sea-ink-soft)]">
            Total features: {featuresQuery.data?.totalCount ?? 0}
          </p>
        ) : null}
      </section>
    </div>
  );
}
