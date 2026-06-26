import type { MotionConflictStrategy } from './motion-conflict-strategy';
import type { MotionTimelineDefinition } from './motion-timeline';
import type { MotionTriggerType } from './motion-trigger';
import type { MotionValidationOptions } from './motion-validation-options';
import type { ReducedMotionStrategy } from './reduced-motion-strategy';

export type MotionTimelinePlayOptions = {
  readonly trigger?: MotionTriggerType;
  readonly respectReducedMotion?: boolean;
  readonly reducedMotionStrategy?: ReducedMotionStrategy;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly conflictStrategy?: MotionConflictStrategy;
  readonly validation?: MotionValidationOptions;
};
