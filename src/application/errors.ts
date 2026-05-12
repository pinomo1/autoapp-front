export type AppErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode;
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
  cause?: unknown;
}

interface ValidationProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

function isValidationProblemDetails(value: unknown): value is ValidationProblemDetails {
  return typeof value === 'object' && value !== null;
}

function toFieldErrors(payload: unknown): Record<string, string> | undefined {
  if (!isValidationProblemDetails(payload) || !payload.errors) {
    return undefined;
  }

  return Object.entries(payload.errors).reduce(
    (acc, [field, messages]) => {
      if (messages.length > 0) {
        acc[field] = messages[0];
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

function statusToCode(status: number): AppErrorCode {
  if (status === 400 || status === 422) return 'VALIDATION';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  return 'UNKNOWN';
}

function fallbackMessage(code: AppErrorCode): string {
  if (code === 'VALIDATION') return 'Please fix the highlighted fields and try again.';
  if (code === 'NOT_FOUND') return 'Requested resource was not found.';
  if (code === 'CONFLICT') return 'Conflict detected. Please refresh and retry.';
  if (code === 'UNAUTHORIZED') return 'You are not authorized. Please sign in again.';
  if (code === 'FORBIDDEN') return 'You do not have permission for this action.';
  return 'Something went wrong. Please try again.';
}

export function toAppError(error: unknown): AppError {
  // If it's already shaped as an AppError, return as-is
  if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string') {
    return error as AppError;
  }

  // Detect the transport error shape thrown by api-client (duck-typed)
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    const status = typeof e.status === 'number' ? (e.status as number) : undefined;
    const payload = e.payload;

    if (typeof status === 'number') {
      const code = statusToCode(status);
      const fieldErrors = toFieldErrors(payload);
      const payloadObj = isValidationProblemDetails(payload) ? payload : undefined;

      return {
        code,
        status,
        fieldErrors,
        message: (payloadObj?.detail as string) || (payloadObj?.title as string) || fallbackMessage(code),
        cause: error,
      };
    }
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message || fallbackMessage('UNKNOWN'),
      cause: error,
    };
  }

  return {
    code: 'UNKNOWN',
    message: fallbackMessage('UNKNOWN'),
    cause: error,
  };
}
