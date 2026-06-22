import type { MotionExecutionPlanSummary } from '../models/motion-execution-plan-summary';
import type { PreparedMotionTimeline } from '../models/prepared-motion-timeline';
import type { ScheduledMotionTimeline } from '../models/scheduled-motion-timeline';

export type CreateMotionExecutionPlanSummaryInput = {
  readonly preparedTimeline: PreparedMotionTimeline;
  readonly scheduledTimeline: ScheduledMotionTimeline;
  readonly preparedReducedMotionTimeline?: PreparedMotionTimeline;
  readonly scheduledReducedMotionTimeline?: ScheduledMotionTimeline;
};

export function createMotionExecutionPlanSummary(
  input: CreateMotionExecutionPlanSummaryInput
): MotionExecutionPlanSummary {
  return {
    trackCount: input.preparedTimeline.tracks.length,
    taskCount: input.scheduledTimeline.tasks.length,
    totalDuration: input.scheduledTimeline.totalDuration,
    hasReducedMotionTimeline: input.preparedReducedMotionTimeline !== undefined,
    ...(input.scheduledReducedMotionTimeline !== undefined
      ? {
          reducedMotionTotalDuration: input.scheduledReducedMotionTimeline.totalDuration
        }
      : {})
  };
}
