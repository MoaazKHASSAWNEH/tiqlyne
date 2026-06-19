export function normalizeBoolean(
  value: unknown,
  defaultValue: boolean
): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}