import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapToFormErrors } from '#/application/form-error-mapper';
import { useCreateCountry } from '#/hooks';
import { useAuth } from '#/features/auth';
import {
  createCountrySchema,
  type CreateCountryFormValues,
} from '#/features/countries/country.schemas';

export const Route = createFileRoute('/countries/create')({
  component: CountryCreatePage,
});

function CountryCreatePage() {
  const auth = useAuth();
  const canMutate = auth.phase === 'ready' && auth.isAuthenticated;
  const navigate = useNavigate();
  const createCountryMutation = useCreateCountry();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCountryFormValues>({
    resolver: zodResolver(createCountrySchema),
    defaultValues: {
      countryName: '',
      countryCode: '',
    },
  });

  const onSubmit = async (values: CreateCountryFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const response = await createCountryMutation.mutateAsync(values);
      const countryId = response.id;
      reset();
      await navigate({ to: '/countries/$countryId', params: { countryId } });
    } catch (error) {
      const mapped = mapToFormErrors(error, ['countryName', 'countryCode'] as const);
      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof CreateCountryFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  return (
    <div className="page-wrap px-4 py-10">
      <div className="hero-panel rounded-2xl p-6 md:p-8">
        <p className="island-kicker">Countries</p>
        <h1 className="display-title mt-2 text-3xl font-bold">Create Country</h1>

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

          <div className="mt-2 flex items-center gap-3">
            {canMutate ? (
              <button
                type="submit"
                disabled={isSubmitting || createCountryMutation.isPending}
                className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting || createCountryMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            ) : null}
            <Link
              to="/countries"
              className="rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--sea-ink)] no-underline"
            >
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
