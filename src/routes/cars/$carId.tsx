import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCarById, useCarPhotosByCarId, useDeleteCar } from '#/hooks';

export const Route = createFileRoute('/cars/$carId')({
  component: CarDetailPage,
});

function CarDetailPage() {
  const { carId } = Route.useParams();
  const navigate = useNavigate();
  const carQuery = useCarById(carId);
  const photosQuery = useCarPhotosByCarId(carId);
  const deleteCarMutation = useDeleteCar();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const photos = useMemo(() => {
    return [...(photosQuery.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [photosQuery.data]);

  const hasPhotos = photos.length > 0;
  const activePhoto = hasPhotos ? photos[activePhotoIndex] : null;

  useEffect(() => {
    if (activePhotoIndex > photos.length - 1) {
      setActivePhotoIndex(0);
    }
  }, [activePhotoIndex, photos.length]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this car?')) {
      return;
    }

    await deleteCarMutation.mutateAsync(carId);
    await navigate({ to: '/cars' });
  };

  const goPrevPhoto = () => {
    if (!hasPhotos) return;
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goNextPhoto = () => {
    if (!hasPhotos) return;
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (!hasPhotos || photos.length < 2 || touchStartX.current === null) {
      touchStartX.current = null;
      return;
    }

    const endX = event.changedTouches[0]?.clientX;
    if (typeof endX !== 'number') {
      touchStartX.current = null;
      return;
    }

    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    const SWIPE_THRESHOLD_PX = 40;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    if (deltaX > 0) {
      goPrevPhoto();
      return;
    }

    goNextPhoto();
  };

  if (carQuery.isLoading) {
    return <div className="page-wrap px-4 py-10 text-[var(--sea-ink-soft)]">Loading car...</div>;
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <div className="page-wrap px-4 py-10">
        <div className="metrics-panel rounded-2xl p-6">Failed to load car.</div>
      </div>
    );
  }

  const car = carQuery.data;

  return (
    <div className="page-wrap px-4 py-10">
      <Link
        to="/cars"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:underline"
      >
        ← Back to Cars
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <section className="lg:col-span-2">
          <div className="hero-panel rounded-[2rem] p-6 md:p-8">
            <div className="mb-6">
              {photosQuery.isLoading ? (
                <div className="h-64 rounded-xl bg-[var(--line)]" />
              ) : photosQuery.isError ? (
                car.mainPhotoUrl ? (
                  <div className="h-64 overflow-hidden rounded-xl bg-[var(--line)]">
                    <img src={car.mainPhotoUrl} alt="Car" className="h-full w-full object-cover" />
                  </div>
                ) : null
              ) : hasPhotos && activePhoto ? (
                <>
                  <div
                    className="relative h-64 overflow-hidden rounded-xl bg-[var(--line)]"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img src={activePhoto.photoUrl} alt="Car" className="h-full w-full object-cover" />

                    {photos.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={goPrevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur"
                          aria-label="Previous photo"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={goNextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur"
                          aria-label="Next photo"
                        >
                          ›
                        </button>
                      </>
                    ) : null}

                    <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                      {activePhotoIndex + 1} / {photos.length}
                    </div>
                  </div>

                  {photos.length > 1 ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {photos.map((photo, index) => {
                        const isActive = index === activePhotoIndex;
                        return (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => setActivePhotoIndex(index)}
                            className={`h-16 w-24 flex-none overflow-hidden rounded-md border-2 transition ${
                              isActive ? 'border-[var(--lagoon-deep)]' : 'border-transparent'
                            }`}
                            aria-label={`Show photo ${index + 1}`}
                          >
                            <img src={photo.photoUrl} alt="Car thumbnail" className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              ) : car.mainPhotoUrl ? (
                <div className="h-64 overflow-hidden rounded-lg bg-[var(--line)]">
                  <img src={car.mainPhotoUrl} alt="Car" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg bg-[var(--line)] px-4 text-center text-sm text-[var(--sea-ink-soft)]">
                  No photos uploaded yet.
                </div>
              )}
            </div>

            <p className="island-kicker">Car Details</p>
            <h1 className="display-title mt-2 text-3xl font-bold">
              {car.brandName} {car.model}
            </h1>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              {car.year} · ${car.price.toLocaleString()}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Condition</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{car.carCondition}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Type</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{car.carType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Fuel Type</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{car.fuelType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Transmission</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{car.transmissionType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Color</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{car.color}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Horsepower</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{car.horsepower} hp</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Engine Volume</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">
                  {car.engineVolumeCc.toLocaleString()} cc
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Mileage</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">
                  {car.mileage.toLocaleString()} miles
                </p>
              </div>
            </div>

            {car.features && car.features.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-[var(--sea-ink)]">Features</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {car.features.map((feature) => (
                    <span
                      key={feature.id}
                      className="inventory-chip text-xs font-semibold"
                    >
                      {feature.featureName}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/cars/$carId/photos"
                params={{ carId }}
                className="rounded-full bg-[var(--sea-ink)] px-4 py-2 font-semibold text-white no-underline shadow-[0_10px_24px_rgba(10,16,24,0.28)]"
              >
                Manage Photos
              </Link>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="metrics-panel h-fit rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Actions</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Car ID: {car.id}
          </p>
          <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
            <Link
              to="/cars"
              className="block rounded-full border border-[var(--line)] px-4 py-2 text-center font-semibold text-[var(--sea-ink)] no-underline"
            >
              Back to List
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteCarMutation.isPending}
              className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-2 text-center font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteCarMutation.isPending ? 'Deleting...' : 'Delete Car'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
