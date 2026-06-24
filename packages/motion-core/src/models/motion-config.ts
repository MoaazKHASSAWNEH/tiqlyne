import type { MotionTriggerType } from './motion-trigger';
import type { ReducedMotionStrategy } from './reduced-motion-strategy';
import type { MotionConflictStrategy } from './motion-conflict-strategy';
import type { MotionEasing } from './motion-easing';

export type MotionConfig = {
  readonly id: string;
  readonly type: string;
  readonly trigger?: MotionTriggerType;
  readonly enabled?: boolean;
  readonly duration?: number;
  readonly delay?: number;
  readonly easing?: MotionEasing;
  readonly options?: Record<string, unknown>;
  readonly respectReducedMotion?: boolean;
  readonly reducedMotionStrategy?: ReducedMotionStrategy;
  readonly conflictStrategy?: MotionConflictStrategy;
  readonly priority?: number;
  readonly metadata?: Record<string, unknown>;
};
