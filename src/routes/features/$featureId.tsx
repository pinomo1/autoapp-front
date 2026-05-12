import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapToFormErrors } from '#/application/form-error-mapper';
import { useDeleteFeature, useFeatureById, useUpdateFeature } from '#/hooks';
import type { UpdateFeatureDto } from '#/types';
import {
  updateFeatureSchema,
  type UpdateFeatureFormValues,
} from '#/features/features/feature.schemas';

export const Route = createFileRoute('/features/$featureId')({
  component: FeatureDetailPage,
});

function FeatureDetailPage() {
  const { featureId } = Route.useParams();
  const navigate = useNavigate();
  const featureQuery = useFeatureById(featureId);
  const updateFeatureMutation = useUpdateFeature();
  const deleteFeatureMutation = useDeleteFeature();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFeatureFormValues>({
    resolver: zodResolver(updateFeatureSchema),
    defaultValues: {
      featureName: '',
    },
  });

  useEffect(() => {
    if (featureQuery.data) {
      reset({ featureName: featureQuery.data.featureName });
    }
  }, [featureQuery.data, reset]);

  const onSubmit = async (values: UpdateFeatureFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const updateData: UpdateFeatureDto = {
        featureName: values.featureName,
      };

      await updateFeatureMutation.mutateAsync({ id: featureId, data: updateData });
    } catch (error) {
      const mapped = mapToFormErrors(error, ['featureName'] as const);
      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof UpdateFeatureFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this feature?')) {
      return;
    }

    await deleteFeatureMutation.mutateAsync(featureId);
    await navigate({ to: '/features' });
  };

  if (featureQuery.isLoading) {
    return <div className="page-wrap px-4 py-10">Loading feature...</div>;
  }

  if (featureQuery.isError || !featureQuery.data) {
    return (
      <div className="page-wrap px-4 py-10">
        <div className="island-shell rounded-2xl p-6">Failed to load feature.</div>
      </div>
    );
  }

  return (
    <div className="page-wrap px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="hero-panel rounded-[2rem] p-6 md:p-8">
          <p className="island-kicker">Features</p>
          <h1 className="display-title mt-2 text-3xl font-bold">Edit Feature</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Feature ID: {featureQuery.data.id}
          </p>

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

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || updateFeatureMutation.isPending}
                className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting || updateFeatureMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                to="/features"
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
            Remove this feature if it is no longer used.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteFeatureMutation.isPending}
            className="mt-4 rounded-full border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteFeatureMutation.isPending ? 'Deleting...' : 'Delete Feature'}
          </button>
        </aside>
      </div>
    </div>
  );
}
