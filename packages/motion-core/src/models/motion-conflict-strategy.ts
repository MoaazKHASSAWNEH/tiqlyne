export type MotionConflictStrategy = 'replace' | 'parallel' | 'ignore';

export const motionConflictStrategies = ['replace', 'parallel', 'ignore'] as const;

export function isMotionConflictStrategy(value: unknown): value is MotionConflictStrategy {
  return (
    typeof value === 'string' && motionConflictStrategies.includes(value as MotionConflictStrategy)
  );
}
