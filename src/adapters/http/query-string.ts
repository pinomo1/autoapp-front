export function toQueryString<T extends object>(params: T): string {
  return new URLSearchParams(
    Object.entries(params as Record<string, unknown>).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>),
  ).toString();
}
