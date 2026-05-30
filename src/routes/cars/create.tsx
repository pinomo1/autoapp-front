import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapToFormErrors } from '#/application/form-error-mapper';
import { useBrandOptions, useCarEnums, useCreateCar } from '#/hooks';
import { useAuth } from '#/features/auth';
import {
  createCarSchema,
  type CreateCarFormValues,
} from '#/features/cars/car.schemas';

export const Route = createFileRoute('/cars/create')({
  component: CarCreatePage,
});

function CarCreatePage() {
  const auth = useAuth();
  const canMutate = auth.phase === 'ready' && auth.isAuthenticated;
  const navigate = useNavigate();
  const brandsQuery = useBrandOptions();
  const carEnumsQuery = useCarEnums();
  const createCarMutation = useCreateCar();
  const [formError, setFormError] = useState<string | null>(null);

  const enumOptions = useMemo(
    () => ({
      carConditions: carEnumsQuery.data?.carConditions ?? ['New', 'Used', 'Refurbished'],
      carTypes: carEnumsQuery.data?.carTypes ?? ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Wagon'],
      fuelTypes: carEnumsQuery.data?.fuelTypes ?? ['Gasoline', 'Diesel', 'Electric', 'Hybrid'],
      transmissionTypes: carEnumsQuery.data?.transmissionTypes ?? ['Manual', 'Automatic', 'CVT'],
      colors: carEnumsQuery.data?.colors ?? ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Brown'],
    }),
    [carEnumsQuery.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<CreateCarFormValues>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      brandId: '',
      model: '',
      year: new Date().getFullYear(),
      carCondition: 'Used',
      carType: 'Sedan',
      fuelType: 'Gasoline',
      transmissionType: 'Automatic',
      color: 'Black',
      horsepower: 100,
      engineVolumeCc: 1000,
      price: 1,
      mileage: 0,
    },
  });

  const onSubmit = async (values: CreateCarFormValues) => {
    setFormError(null);
    clearErrors();

    try {
      const response = await createCarMutation.mutateAsync(values);
      const carId = response.id;
      reset();
      await navigate({ to: '/cars/$carId', params: { carId } });
    } catch (error) {
      const mapped = mapToFormErrors(
        error,
        [
          'brandId',
          'model',
          'year',
          'carCondition',
          'carType',
          'fuelType',
          'transmissionType',
          'color',
          'horsepower',
          'engineVolumeCc',
          'price',
          'mileage',
        ] as const,
      );

      if (mapped.formMessage) {
        setFormError(mapped.formMessage);
      }

      Object.entries(mapped.fields).forEach(([field, message]) => {
        setError(field as keyof CreateCarFormValues, {
          type: 'server',
          message,
        });
      });
    }
  };

  return (
    <div className="page-wrap px-4 py-10">
      <div className="hero-panel rounded-2xl p-6 md:p-8">
        <p className="island-kicker">Cars</p>
        <h1 className="display-title mt-2 text-3xl font-bold">Create Car</h1>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Brand</span>
            <select
              {...register('brandId')}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2"
              disabled={brandsQuery.isLoading || brandsQuery.isError}
            >
              <option value="">Select brand</option>
              {(brandsQuery.data?.items ?? []).map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </option>
              ))}
            </select>
            {errors.brandId ? (
              <span className="text-sm text-red-600">{errors.brandId.message}</span>
            ) : null}
            {brandsQuery.isError ? (
              <span className="text-sm text-red-600">
                Failed to load brands. Please refresh and try again.
              </span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Model</span>
            <input
              {...register('model')}
              className="glass-input rounded-lg px-3 py-2"
              placeholder="e.g. X5"
            />
            {errors.model ? (
              <span className="text-sm text-red-600">{errors.model.message}</span>
            ) : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Year</span>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })}
                className="glass-input rounded-lg px-3 py-2"
              />
              {errors.year ? (
                <span className="text-sm text-red-600">{errors.year.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Condition</span>
              <select
                {...register('carCondition')}
                className="glass-select rounded-lg px-3 py-2"
                disabled={carEnumsQuery.isLoading && !carEnumsQuery.data}
              >
                {enumOptions.carConditions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.carCondition ? (
                <span className="text-sm text-red-600">{errors.carCondition.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Type</span>
              <select
                {...register('carType')}
                className="glass-select rounded-lg px-3 py-2"
                disabled={carEnumsQuery.isLoading && !carEnumsQuery.data}
              >
                {enumOptions.carTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.carType ? (
                <span className="text-sm text-red-600">{errors.carType.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Fuel Type</span>
              <select
                {...register('fuelType')}
                className="glass-select rounded-lg px-3 py-2"
                disabled={carEnumsQuery.isLoading && !carEnumsQuery.data}
              >
                {enumOptions.fuelTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.fuelType ? (
                <span className="text-sm text-red-600">{errors.fuelType.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Transmission</span>
              <select
                {...register('transmissionType')}
                className="glass-select rounded-lg px-3 py-2"
                disabled={carEnumsQuery.isLoading && !carEnumsQuery.data}
              >
                {enumOptions.transmissionTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.transmissionType ? (
                <span className="text-sm text-red-600">{errors.transmissionType.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Color</span>
              <select
                {...register('color')}
                className="glass-select rounded-lg px-3 py-2"
                disabled={carEnumsQuery.isLoading && !carEnumsQuery.data}
              >
                {enumOptions.colors.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.color ? (
                <span className="text-sm text-red-600">{errors.color.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Horsepower</span>
              <input
                type="number"
                {...register('horsepower', { valueAsNumber: true })}
                className="glass-input rounded-lg px-3 py-2"
              />
              {errors.horsepower ? (
                <span className="text-sm text-red-600">{errors.horsepower.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Engine Volume (cc)</span>
              <input
                type="number"
                {...register('engineVolumeCc', { valueAsNumber: true })}
                className="glass-input rounded-lg px-3 py-2"
              />
              {errors.engineVolumeCc ? (
                <span className="text-sm text-red-600">{errors.engineVolumeCc.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Price</span>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="glass-input rounded-lg px-3 py-2"
              />
              {errors.price ? (
                <span className="text-sm text-red-600">{errors.price.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Mileage</span>
              <input
                type="number"
                step="0.1"
                {...register('mileage', { valueAsNumber: true })}
                className="glass-input rounded-lg px-3 py-2"
              />
              {errors.mileage ? (
                <span className="text-sm text-red-600">{errors.mileage.message}</span>
              ) : null}
            </label>
          </div>

          {carEnumsQuery.isError ? (
            <p className="text-sm text-red-600">
              Failed to load enum options. Using fallback values.
            </p>
          ) : null}

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="mt-2 flex items-center gap-3">
            {canMutate ? (
              <button
                type="submit"
                disabled={createCarMutation.isPending}
                className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(21,95,209,0.24)]"
              >
                {createCarMutation.isPending ? 'Creating...' : 'Create Car'}
              </button>
            ) : null}
            <Link
              to="/cars"
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
