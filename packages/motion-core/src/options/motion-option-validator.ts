export type MotionOptionValidator<TOptions extends object> = (options: TOptions) => string | null;

function readComparableNumber(
  options: Readonly<Record<PropertyKey, unknown>>,
  key: PropertyKey
): number | null {
  const value = options[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function validateDifferent<
  const TLeftKey extends PropertyKey,
  const TRightKey extends PropertyKey
>(
  leftKey: TLeftKey,
  rightKey: TRightKey,
  message: string
): MotionOptionValidator<Record<TLeftKey | TRightKey, unknown>> {
  return (options: Record<TLeftKey | TRightKey, unknown>): string | null => {
    const leftValue: unknown = options[leftKey];
    const rightValue: unknown = options[rightKey];

    return Object.is(leftValue, rightValue) ? message : null;
  };
}

export function validateGreaterThan<
  const TLeftKey extends PropertyKey,
  const TRightKey extends PropertyKey
>(
  leftKey: TLeftKey,
  rightKey: TRightKey,
  message: string
): MotionOptionValidator<Record<TLeftKey | TRightKey, unknown>> {
  return (options: Record<TLeftKey | TRightKey, unknown>): string | null => {
    const leftValue = readComparableNumber(options, leftKey);
    const rightValue = readComparableNumber(options, rightKey);

    return leftValue !== null && rightValue !== null && leftValue > rightValue ? null : message;
  };
}

export function validateGreaterThanOrEqual<
  const TLeftKey extends PropertyKey,
  const TRightKey extends PropertyKey
>(
  leftKey: TLeftKey,
  rightKey: TRightKey,
  message: string
): MotionOptionValidator<Record<TLeftKey | TRightKey, unknown>> {
  return (options: Record<TLeftKey | TRightKey, unknown>): string | null => {
    const leftValue = readComparableNumber(options, leftKey);
    const rightValue = readComparableNumber(options, rightKey);

    return leftValue !== null && rightValue !== null && leftValue >= rightValue ? null : message;
  };
}

export function validateLessThan<
  const TLeftKey extends PropertyKey,
  const TRightKey extends PropertyKey
>(
  leftKey: TLeftKey,
  rightKey: TRightKey,
  message: string
): MotionOptionValidator<Record<TLeftKey | TRightKey, unknown>> {
  return validateGreaterThan(rightKey, leftKey, message);
}

export function validateLessThanOrEqual<
  const TLeftKey extends PropertyKey,
  const TRightKey extends PropertyKey
>(
  leftKey: TLeftKey,
  rightKey: TRightKey,
  message: string
): MotionOptionValidator<Record<TLeftKey | TRightKey, unknown>> {
  return validateGreaterThanOrEqual(rightKey, leftKey, message);
}

export function validateIncreasing<
  const TFromKey extends PropertyKey,
  const TToKey extends PropertyKey
>(
  fromKey: TFromKey,
  toKey: TToKey,
  message: string
): MotionOptionValidator<Record<TFromKey | TToKey, unknown>> {
  return validateGreaterThan(toKey, fromKey, message);
}

export function validateDecreasing<
  const TFromKey extends PropertyKey,
  const TToKey extends PropertyKey
>(
  fromKey: TFromKey,
  toKey: TToKey,
  message: string
): MotionOptionValidator<Record<TFromKey | TToKey, unknown>> {
  return validateGreaterThan(fromKey, toKey, message);
}

export function runMotionOptionValidators<TOptions extends object>(
  options: TOptions,
  validators: ReadonlyArray<MotionOptionValidator<TOptions>>
): ReadonlyArray<string> {
  const errors: string[] = [];

  for (const validator of validators) {
    const error = validator(options);

    if (error !== null) {
      errors.push(error);
    }
  }

  return errors;
}
