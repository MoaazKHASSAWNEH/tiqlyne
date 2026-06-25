import type { MotionTargetReference } from '../models/motion-target';

export type MotionTargetInput = 'self' | MotionTargetReference;

export function normalizeMotionTargetInput(target: MotionTargetInput): MotionTargetReference {
  if (target === 'self') {
    return {
      type: 'self'
    };
  }

  return target;
}
