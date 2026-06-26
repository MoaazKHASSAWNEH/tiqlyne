import type { MotionTimelinePlayOptions } from '../models/motion-timeline-play-options';
import type { MotionTriggerType } from '../models/motion-trigger';
import type { MotionConflictStrategy } from '../models/motion-conflict-strategy';
import type { ReducedMotionStrategy } from '../models/reduced-motion-strategy';
import { isMotionTriggerType } from '../models/motion-trigger';
import { isMotionConflictStrategy } from '../models/motion-conflict-strategy';

export type NormalizedMotionTimelinePlayOptions = {
  readonly trigger: MotionTriggerType;
  readonly respectReducedMotion: boolean;
  readonly reducedMotionStrategy: ReducedMotionStrategy;
  readonly conflictStrategy: MotionConflictStrategy;
  readonly validation: MotionTimelinePlayOptions['validation'];
};

const REDUCED_MOTION_STRATEGIES = ['skip', 'simplify', 'preserve'] as const;

export function normalizeMotionTimelinePlayOptions(
  options: MotionTimelinePlayOptions | undefined
): NormalizedMotionTimelinePlayOptions {
  return {
    trigger: isMotionTriggerType(options?.trigger) ? options.trigger : 'onEnter',
    respectReducedMotion:
      typeof options?.respectReducedMotion === 'boolean' ? options.respectReducedMotion : true,
    reducedMotionStrategy: isReducedMotionStrategy(options?.reducedMotionStrategy)
      ? options.reducedMotionStrategy
      : 'skip',
    conflictStrategy: isMotionConflictStrategy(options?.conflictStrategy)
      ? options.conflictStrategy
      : 'replace',
    validation: options?.validation
  };
}

function isReducedMotionStrategy(value: unknown): value is ReducedMotionStrategy {
  return REDUCED_MOTION_STRATEGIES.includes(value as ReducedMotionStrategy);
}
