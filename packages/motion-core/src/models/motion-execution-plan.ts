import type { MotionDiagnostic } from './motion-diagnostic';
import type { MotionTimelineDefinition } from './motion-timeline';
import type { PreparedMotionTimeline } from './prepared-motion-timeline';
import type { ScheduledMotionTimeline } from './scheduled-motion-timeline';

export type MotionExecutionPlan = {
  readonly timeline: MotionTimelineDefinition;
  readonly preparedTimeline: PreparedMotionTimeline;
  readonly scheduledTimeline: ScheduledMotionTimeline;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly preparedReducedMotionTimeline?: PreparedMotionTimeline;
  readonly scheduledReducedMotionTimeline?: ScheduledMotionTimeline;
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};
