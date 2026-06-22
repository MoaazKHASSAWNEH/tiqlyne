import type { MotionDiagnostic } from './motion-diagnostic';
import type { MotionTimelineDefinition } from './motion-timeline';
import type { PreparedMotionTimeline } from './prepared-motion-timeline';

export type MotionExecutionPlan = {
  readonly timeline: MotionTimelineDefinition;
  readonly preparedTimeline: PreparedMotionTimeline;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly preparedReducedMotionTimeline?: PreparedMotionTimeline;
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};
