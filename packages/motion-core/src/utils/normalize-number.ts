import { clamp } from './clamp';

export type NormalizeNumberOptions = {
  readonly defaultValue: number;
  readonly min?: number;
  readonly max?: number;
  readonly integer?: boolean;
};

export function normalizeNumber(
  value: unknown,
  options: NormalizeNumberOptions
): number {
  const numberValue = typeof value === 'number' && Number.isFinite(value)
    ? value
    : options.defaultValue;

  const clampedValue =
    typeof options.min === 'number' && typeof options.max === 'number'
      ? clamp(numberValue, options.min, options.max)
      : numberValue;

  return options.integer ? Math.round(clampedValue) : clampedValue;
}