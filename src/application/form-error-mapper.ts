import { toAppError } from './errors';

export interface FormErrorMap<TFieldName extends string> {
  formMessage?: string;
  fields: Partial<Record<TFieldName, string>>;
}

export function mapToFormErrors<TFieldName extends string>(
  error: unknown,
  allowedFields: readonly TFieldName[],
): FormErrorMap<TFieldName> {
  const appError = toAppError(error);

  const fields = Object.entries(appError.fieldErrors ?? {}).reduce(
    (acc, [field, message]) => {
      if (allowedFields.includes(field as TFieldName)) {
        acc[field as TFieldName] = message;
      }
      return acc;
    },
    {} as Partial<Record<TFieldName, string>>,
  );

  const hasFieldErrors = Object.keys(fields).length > 0;
  return {
    formMessage: hasFieldErrors ? undefined : appError.message,
    fields,
  };
}
