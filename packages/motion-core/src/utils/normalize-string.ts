export function normalizeString(
  value: unknown,
  defaultValue: string
): string {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : defaultValue;
}