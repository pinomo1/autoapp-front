import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapToFormErrors } from '#/application/form-error-mapper';
import { useCreateFeature } from '#/hooks';
import {
  createFeatureSchema,
  type CreateFeatureFormValues,
} from '#/features/features/feature.schemas';

export const Route = createFileRoute('/features/create')({
  component: FeatureCreatePage,
});

function FeatureCreatePage() {
  const navigate = useNavigate();
  const createFeatureMutation = useCreateFeature();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateFeatureFormValues>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      featureName: '',
    },
  });

  const onSubmit = async (values: CreateFeatureFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const response = await createFeatureMutation.mutateAsync(values);
      const featureId = response.id;
      reset();
      await navigate({ to: '/features/$featureId', params: { featureId } });
    } catch (error) {
      const mapped = mapToFormErrors(error, ['featureName'] as const);
      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof CreateFeatureFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  return (
    <div className="page-wrap px-4 py-10">
      <div className="hero-panel rounded-2xl p-6 md:p-8">
        <p className="island-kicker">Features</p>
        <h1 className="display-title mt-2 text-3xl font-bold">Create Feature</h1>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Feature Name</span>
            <input
              {...register('featureName')}
              className="glass-input rounded-lg px-3 py-2"
              placeholder="e.g. Heated Seats"
            />
            {errors.featureName ? (
              <span className="text-sm text-red-600">{errors.featureName.message}</span>
            ) : null}
          </label>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || createFeatureMutation.isPending}
              className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || createFeatureMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <Link
              to="/features"
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
