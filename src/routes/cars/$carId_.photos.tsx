import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo, useState, useEffect } from 'react';
import type { ComponentProps } from 'react';
import { mapToFormErrors } from '#/application/form-error-mapper';
import {
  useCarPhotosByCarId,
  useCreateCarPhoto,
  useDeleteCarPhoto,
  useUpdateCarPhoto,
} from '#/hooks';
import type { CarPhotoResponseDto } from '#/types';

export const Route = createFileRoute('/cars/$carId_/photos')({
  component: CarPhotosPage,
});

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;

function CarPhotosPage() {
  const { carId } = Route.useParams();
  const photosQuery = useCarPhotosByCarId(carId);
  const createPhotoMutation = useCreateCarPhoto();
  const updatePhotoMutation = useUpdateCarPhoto();
  const deletePhotoMutation = useDeleteCarPhoto();

  const [createPhotoFile, setCreatePhotoFile] = useState<File | null>(null);
  const [createPreviewUrl, setCreatePreviewUrl] = useState<string | null>(null);
  const [createDisplayOrder, setCreateDisplayOrder] = useState<number>(0);
  const [createIsMainPhoto, setCreateIsMainPhoto] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editPhotoId, setEditPhotoId] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(0);
  const [editIsMainPhoto, setEditIsMainPhoto] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const photos = useMemo(() => {
    return [...(photosQuery.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [photosQuery.data]);

  // Cleanup object URLs on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    };
  }, [createPreviewUrl, editPreviewUrl]);

  const startEdit = (photo: CarPhotoResponseDto) => {
    setEditPhotoId(photo.id);
    setEditPhotoFile(null);
    setEditPreviewUrl(photo.photoUrl);
    setEditDisplayOrder(photo.displayOrder);
    setEditIsMainPhoto(photo.isMainPhoto);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditPhotoId(null);
    setEditPhotoFile(null);
    setEditPreviewUrl(null);
    setEditDisplayOrder(0);
    setEditIsMainPhoto(false);
    setEditError(null);
  };

  const handleCreate: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setCreateError(null);

    if (!createPhotoFile) {
      setCreateError('Please select a photo file to upload.');
      return;
    }

    try {
      await createPhotoMutation.mutateAsync({
        carId,
        photo: {
          carId,
          file: createPhotoFile,
          displayOrder: createDisplayOrder,
          isMainPhoto: createIsMainPhoto,
        },
      });

      setCreatePhotoFile(null);
      setCreatePreviewUrl(null);
      setCreateDisplayOrder(0);
      setCreateIsMainPhoto(false);
    } catch (error) {
      const mapped = mapToFormErrors(error, [] as const);
      setCreateError(mapped.formMessage ?? 'Failed to create photo.');
    }
  };

  const handleUpdate = async (photoId: string) => {
    setEditError(null);

    // If replacing the image, ensure a file is selected or keep existing preview
    if (editPhotoFile === null && !editPreviewUrl) {
      setEditError('Please select a photo file or preserve the existing image.');
      return;
    }

    try {
      await updatePhotoMutation.mutateAsync({
        carId,
        photoId,
        photo: {
          file: editPhotoFile ?? undefined,
          photoUrl: editPreviewUrl ?? undefined,
          displayOrder: editDisplayOrder,
          isMainPhoto: editIsMainPhoto,
        },
      });

      cancelEdit();
    } catch (error) {
      const mapped = mapToFormErrors(error, [] as const);
      setEditError(mapped.formMessage ?? 'Failed to update photo.');
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!window.confirm('Delete this photo?')) {
      return;
    }

    await deletePhotoMutation.mutateAsync({ carId, photoId });

    if (editPhotoId === photoId) {
      cancelEdit();
    }
  };

  return (
    <div className="page-wrap px-4 py-10">
      <div className="mb-6">
        <Link
          to="/cars/$carId"
          params={{ carId }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
        >
          ← Back to Car
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="island-shell h-fit rounded-[2rem] p-6">
          <p className="island-kicker">Photos</p>
          <h1 className="display-title mt-2 text-3xl font-bold">Add Car Photo</h1>

          <form className="mt-6 grid gap-4" onSubmit={handleCreate}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Photo File</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const f = event.target.files?.[0] ?? null;
                  if (f) {
                    // revoke old preview if present
                    if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
                    setCreatePhotoFile(f);
                    setCreatePreviewUrl(URL.createObjectURL(f));
                  } else {
                    setCreatePhotoFile(null);
                    if (createPreviewUrl) {
                      URL.revokeObjectURL(createPreviewUrl);
                      setCreatePreviewUrl(null);
                    }
                  }
                }}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2"
              />
              {createPreviewUrl ? (
                <img src={createPreviewUrl} alt="Preview" className="mt-2 h-36 w-full object-cover rounded-lg" />
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Display Order</span>
              <input
                type="number"
                value={createDisplayOrder}
                onChange={(event) => setCreateDisplayOrder(Number(event.target.value || 0))}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={createIsMainPhoto}
                onChange={(event) => setCreateIsMainPhoto(event.target.checked)}
              />
              Set as main photo
            </label>

            {createError ? <p className="text-sm text-red-600">{createError}</p> : null}

            <button
              type="submit"
              disabled={createPhotoMutation.isPending}
              className="rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPhotoMutation.isPending ? 'Adding...' : 'Add Photo'}
            </button>
          </form>
        </section>

        <section className="island-shell rounded-[2rem] p-6">
          <p className="island-kicker">Gallery</p>
          <h2 className="display-title mt-2 text-3xl font-bold">Car Photos</h2>

          {photosQuery.isLoading ? (
            <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">Loading photos...</p>
          ) : photosQuery.isError ? (
            <p className="mt-6 text-sm text-red-600">Failed to load photos.</p>
          ) : photos.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">No photos added yet.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo) => {
                const isEditing = editPhotoId === photo.id;
                const isBusy =
                  updatePhotoMutation.isPending ||
                  deletePhotoMutation.isPending ||
                  createPhotoMutation.isPending;

                return (
                  <article
                    key={photo.id}
                    className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)]"
                  >
                    <div className="h-44 bg-[var(--line)]">
                      <img
                        src={isEditing ? editPreviewUrl || photo.photoUrl : photo.photoUrl}
                        alt="Car photo"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="grid gap-3 p-4">
                      {isEditing ? (
                        <>
                                        <label className="grid gap-1">
                                          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                                            Photo File
                                          </span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                              const f = event.target.files?.[0] ?? null;
                                              if (f) {
                                                if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
                                                setEditPhotoFile(f);
                                                setEditPreviewUrl(URL.createObjectURL(f));
                                              } else {
                                                setEditPhotoFile(null);
                                              }
                                            }}
                                            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
                                          />
                                          {editPreviewUrl ? (
                                            <img src={editPreviewUrl} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-lg" />
                                          ) : null}
                                        </label>

                          <label className="grid gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                              Display Order
                            </span>
                            <input
                              type="number"
                              value={editDisplayOrder}
                              onChange={(event) => setEditDisplayOrder(Number(event.target.value || 0))}
                              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
                            />
                          </label>

                          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)]">
                            <input
                              type="checkbox"
                              checked={editIsMainPhoto}
                              onChange={(event) => setEditIsMainPhoto(event.target.checked)}
                            />
                            Main photo
                          </label>

                          {editError ? <p className="text-sm text-red-600">{editError}</p> : null}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdate(photo.id)}
                              className="rounded-lg bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={cancelEdit}
                              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
                            <span className="rounded-full bg-[var(--chip-bg)] px-2 py-1 font-semibold">
                              Order: {photo.displayOrder}
                            </span>
                            {photo.isMainPhoto ? (
                              <span className="rounded-full bg-[rgba(40,138,103,0.16)] px-2 py-1 font-semibold text-[var(--sea-ink)]">
                                Main
                              </span>
                            ) : null}
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => startEdit(photo)}
                              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(photo.id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}