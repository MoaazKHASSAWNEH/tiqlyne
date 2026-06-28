import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionTargetReference } from '../models/motion-target';
import type {
  MotionStepPosition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTimelineLabels
} from '../models/motion-timeline';
import type { MotionValidationOptions } from '../models/motion-validation-options';

export type MotionCompositionDefinition = {
  readonly defaults?: MotionTimelineDefaults;
  readonly labels?: MotionTimelineLabels;
  readonly items: ReadonlyArray<MotionCompositionItem>;
};

export type MotionCompositionItem = RegisteredMotionCompositionItem | TimelineCompositionItem;

export type RegisteredMotionCompositionItem = {
  readonly kind: 'motion';
  readonly type: string;
  readonly target?: MotionTargetReference;
  readonly options?: Record<string, unknown>;
  readonly at?: MotionStepPosition;
  readonly defaults?: MotionTimelineDefaults;
};

export type TimelineCompositionItem = {
  readonly kind: 'timeline';
  readonly timeline: MotionTimelineDefinition;
  readonly target?: MotionTargetReference;
  readonly at?: MotionStepPosition;
  readonly defaults?: MotionTimelineDefaults;
};

export type CompileMotionCompositionContext = {
  readonly registry: MotionRegistry;
  readonly defaults?: MotionTimelineDefaults;
  readonly validation?: MotionValidationOptions;
};
