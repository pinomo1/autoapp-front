import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapToFormErrors } from '#/application/form-error-mapper';
import {
  useBrandById,
  useCountryOptions,
  useDeleteBrand,
  useUpdateBrand,
  useUploadBrandLogo,
} from '#/hooks';
import type { UpdateBrandDto } from '#/types';
import {
  updateBrandSchema,
  type UpdateBrandFormValues,
} from '#/features/brands/brand.schemas';
import { useAuth } from '#/features/auth';

export const Route = createFileRoute('/brands/$brandId')({
  component: BrandDetailPage,
});

function BrandDetailPage() {
  const auth = useAuth();
  const canMutate = auth.phase === 'ready' && auth.isAuthenticated;
  const { brandId } = Route.useParams();
  const navigate = useNavigate();
  const brandQuery = useBrandById(brandId);
  const countriesQuery = useCountryOptions();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();
  const uploadBrandLogoMutation = useUploadBrandLogo();
  const [formError, setFormError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBrandFormValues>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues: {
      brandName: '',
      countryId: '',
    },
  });

  useEffect(() => {
    if (brandQuery.data) {
      reset({ brandName: brandQuery.data.brandName, countryId: brandQuery.data.countryId });
    }
  }, [brandQuery.data, reset]);

  const onSubmit = async (values: UpdateBrandFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const updateData: UpdateBrandDto = {
        brandName: values.brandName,
        countryId: values.countryId,
      };

      await updateBrandMutation.mutateAsync({ id: brandId, data: updateData });
    } catch (error) {
      const mapped = mapToFormErrors(error, ['brandName', 'countryId'] as const);
      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof UpdateBrandFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  const handleLogoUpload = async () => {
    setLogoError(null);
    setLogoMessage(null);

    if (!logoFile) {
      setLogoError('Choose a logo file first.');
      return;
    }

    try {
      await uploadBrandLogoMutation.mutateAsync({ id: brandId, file: logoFile });
      setLogoFile(null);
      setLogoMessage('Logo uploaded.');
    } catch (error) {
      const mapped = mapToFormErrors(error, [] as const);
      setLogoError(mapped.formMessage ?? 'Failed to upload logo.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this brand?')) {
      return;
    }

    await deleteBrandMutation.mutateAsync(brandId);
    await navigate({ to: '/brands' });
  };

  if (brandQuery.isLoading) {
    return <div className="page-wrap px-4 py-10">Loading brand...</div>;
  }

  if (brandQuery.isError || !brandQuery.data) {
    return (
      <div className="page-wrap px-4 py-10">
        <div className="island-shell rounded-2xl p-6">Failed to load brand.</div>
      </div>
    );
  }

  return (
    <div className="page-wrap px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="hero-panel rounded-[2rem] p-6 md:p-8">
          <p className="island-kicker">Brands</p>
          <h1 className="display-title mt-2 text-3xl font-bold">Edit Brand</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Brand ID: {brandQuery.data.id}
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Brand Name</span>
              <input
                {...register('brandName')}
                className="glass-input rounded-lg px-3 py-2"
                placeholder="e.g. BMW"
              />
              {errors.brandName ? (
                <span className="text-sm text-red-600">{errors.brandName.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Country</span>
              <select
                {...register('countryId')}
                className="glass-select rounded-lg px-3 py-2"
                disabled={countriesQuery.isLoading || countriesQuery.isError}
              >
                <option value="">Select country</option>
                {(countriesQuery.data?.items ?? []).map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.countryName} ({country.countryCode})
                  </option>
                ))}
              </select>
              {errors.countryId ? (
                <span className="text-sm text-red-600">{errors.countryId.message}</span>
              ) : null}
              {countriesQuery.isError ? (
                <span className="text-sm text-red-600">
                  Failed to load countries. Please refresh and try again.
                </span>
              ) : null}
            </label>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {canMutate ? (
                <button
                  type="submit"
                  disabled={isSubmitting || updateBrandMutation.isPending}
                  className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting || updateBrandMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              ) : null}
              <Link
                to="/brands"
                className="rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--sea-ink)] no-underline"
              >
                Back to list
              </Link>
            </div>
          </form>
        </section>

        <aside className="metrics-panel h-fit rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Details</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-strong)]">
            {brandQuery.data.logoUrl ? (
              <img
                src={brandQuery.data.logoUrl}
                alt={`${brandQuery.data.brandName} logo`}
                className="h-40 w-full object-contain p-4"
              />
            ) : (
              <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-[var(--sea-ink-soft)]">
                No logo uploaded yet.
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {logoMessage ?? (brandQuery.data.logoUrl ? 'Logo uploaded.' : 'Add a logo for this brand.')}
          </p>

          <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Brand Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
            </label>
            {logoFile ? (
              <p className="text-xs text-[var(--sea-ink-soft)]">Selected: {logoFile.name}</p>
            ) : null}
            {logoError ? <p className="text-sm text-red-600">{logoError}</p> : null}
            {canMutate ? (
              <>
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={uploadBrandLogoMutation.isPending}
                  className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadBrandLogoMutation.isPending ? 'Uploading...' : 'Upload Logo'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteBrandMutation.isPending}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteBrandMutation.isPending ? 'Deleting...' : 'Delete Brand'}
                </button>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
