export type MotionOptionValidator<TOptions extends object> = (options: TOptions) => string | null;

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
