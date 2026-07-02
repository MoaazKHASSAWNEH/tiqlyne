import type { MotionDiagnostic } from './motion-diagnostic';
import type { MotionExecutionPlanSummary } from './motion-execution-plan-summary';
import type { MotionTimelineDefinition } from './motion-timeline';
import type { PreparedMotionTimeline } from './prepared-motion-timeline';
import type { ScheduledMotionTimeline } from './scheduled-motion-timeline';

/**
 * Fully prepared execution plan created from a motion timeline.
 *
 * An execution plan is the bridge between declarative timeline input and driver
 * execution. It contains the normalized timeline, prepared timeline, scheduled
 * tasks, optional reduced-motion equivalents, summary information and
 * diagnostics.
 */
export type MotionExecutionPlan = {
  /**
   * Timeline after engine defaults have been applied.
   */
  readonly timeline: MotionTimelineDefinition;

  /**
   * Prepared timeline with resolved track, step and timing metadata.
   */
  readonly preparedTimeline: PreparedMotionTimeline;

  /**
   * Scheduled timeline containing executable tasks.
   */
  readonly scheduledTimeline: ScheduledMotionTimeline;

  /**
   * Optional reduced-motion timeline after defaults have been applied.
   */
  readonly reducedMotionTimeline?: MotionTimelineDefinition;

  /**
   * Optional prepared reduced-motion timeline.
   */
  readonly preparedReducedMotionTimeline?: PreparedMotionTimeline;

  /**
   * Optional scheduled reduced-motion timeline.
   */
  readonly scheduledReducedMotionTimeline?: ScheduledMotionTimeline;

  /**
   * High-level execution summary.
   */
  readonly summary: MotionExecutionPlanSummary;

  /**
   * Diagnostics collected while creating the plan.
   */
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};
