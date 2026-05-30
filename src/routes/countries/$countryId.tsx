import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapToFormErrors } from '#/application/form-error-mapper';
import { useCountryById, useDeleteCountry, useUpdateCountry } from '#/hooks';
import type { UpdateCountryDto } from '#/types';
import {
  updateCountrySchema,
  type UpdateCountryFormValues,
} from '#/features/countries/country.schemas';
import { useAuth } from '#/features/auth';

export const Route = createFileRoute('/countries/$countryId')({
  component: CountryDetailPage,
});

function CountryDetailPage() {
  const auth = useAuth();
  const canMutate = auth.phase === 'ready' && auth.isAuthenticated;
  const { countryId } = Route.useParams();
  const navigate = useNavigate();
  const countryQuery = useCountryById(countryId);
  const updateCountryMutation = useUpdateCountry();
  const deleteCountryMutation = useDeleteCountry();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCountryFormValues>({
    resolver: zodResolver(updateCountrySchema),
    defaultValues: {
      countryName: '',
      countryCode: '',
    },
  });

  useEffect(() => {
    if (countryQuery.data) {
      reset({
        countryName: countryQuery.data.countryName,
        countryCode: countryQuery.data.countryCode,
      });
    }
  }, [countryQuery.data, reset]);

  const onSubmit = async (values: UpdateCountryFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const updateData: UpdateCountryDto = {
        countryName: values.countryName,
        countryCode: values.countryCode,
      };

      await updateCountryMutation.mutateAsync({ id: countryId, data: updateData });
    } catch (error) {
      const mapped = mapToFormErrors(error, ['countryName', 'countryCode'] as const);
      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof UpdateCountryFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this country?')) {
      return;
    }

    await deleteCountryMutation.mutateAsync(countryId);
    await navigate({ to: '/countries' });
  };

  if (countryQuery.isLoading) {
    return <div className="page-wrap px-4 py-10">Loading country...</div>;
  }

  if (countryQuery.isError || !countryQuery.data) {
    return (
      <div className="page-wrap px-4 py-10">
        <div className="island-shell rounded-2xl p-6">Failed to load country.</div>
      </div>
    );
  }

  return (
    <div className="page-wrap px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="hero-panel rounded-[2rem] p-6 md:p-8">
          <p className="island-kicker">Countries</p>
          <h1 className="display-title mt-2 text-3xl font-bold">Edit Country</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Country ID: {countryQuery.data.id}
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Country Name</span>
              <input
                {...register('countryName')}
                className="glass-input rounded-lg px-3 py-2"
                placeholder="e.g. Germany"
              />
              {errors.countryName ? (
                <span className="text-sm text-red-600">{errors.countryName.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Country Code</span>
              <input
                {...register('countryCode')}
                className="glass-input rounded-lg px-3 py-2"
                placeholder="e.g. DE"
              />
              {errors.countryCode ? (
                <span className="text-sm text-red-600">{errors.countryCode.message}</span>
              ) : null}
            </label>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {canMutate ? (
                <button
                  type="submit"
                  disabled={isSubmitting || updateCountryMutation.isPending}
                  className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting || updateCountryMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              ) : null}
              <Link
                to="/countries"
                className="rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--sea-ink)] no-underline"
              >
                Back to list
              </Link>
            </div>
          </form>
        </section>

        <aside className="metrics-panel h-fit rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-[var(--sea-ink)]">Actions</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Remove this country if it is no longer needed.
          </p>
          {canMutate ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteCountryMutation.isPending}
              className="mt-4 rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteCountryMutation.isPending ? 'Deleting...' : 'Delete Country'}
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
