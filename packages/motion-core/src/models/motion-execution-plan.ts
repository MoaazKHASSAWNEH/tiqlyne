import type { MotionDiagnostic } from './motion-diagnostic';
import type { MotionExecutionPlanSummary } from './motion-execution-plan-summary';
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
  readonly summary: MotionExecutionPlanSummary;
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};
