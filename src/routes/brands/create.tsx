import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCountryOptions, useCreateBrand } from '#/hooks';
import { mapToFormErrors } from '#/application/form-error-mapper';
import {
  createBrandSchema,
  type CreateBrandFormValues,
} from '#/features/brands/brand.schemas';

export const Route = createFileRoute('/brands/create')({
  component: BrandCreatePage,
});

function BrandCreatePage() {
  const navigate = useNavigate();
  const createBrandMutation = useCreateBrand();
  const countriesQuery = useCountryOptions();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      brandName: '',
      countryId: '',
    },
  });

  const onSubmit = async (values: CreateBrandFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const response = await createBrandMutation.mutateAsync(values);
      const brandId = response.id;
      reset();
      await navigate({ to: '/brands/$brandId', params: { brandId } });
    } catch (error) {
      const mapped = mapToFormErrors(error, ['brandName', 'countryId'] as const);
      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof CreateBrandFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  return (
    <div className="page-wrap px-4 py-10">
      <div className="hero-panel rounded-2xl p-6 md:p-8">
        <p className="island-kicker">Brands</p>
        <h1 className="display-title mt-2 text-3xl font-bold">Create Brand</h1>

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

          {formError ? (
            <p className="text-sm text-red-600">{formError}</p>
          ) : null}

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || createBrandMutation.isPending}
              className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || createBrandMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
