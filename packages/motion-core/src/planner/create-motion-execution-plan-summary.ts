import type { MotionExecutionPlanSummary } from '../models/motion-execution-plan-summary';
import type { ScheduledMotionTimeline } from '../models/scheduled-motion-timeline';

export type CreateMotionExecutionPlanSummaryInput = {
  readonly scheduledTimeline: ScheduledMotionTimeline;
  readonly scheduledReducedMotionTimeline?: ScheduledMotionTimeline;
};

export function createMotionExecutionPlanSummary(
  input: CreateMotionExecutionPlanSummaryInput
): MotionExecutionPlanSummary {
  const mainSummary = summarizeScheduledTimeline(input.scheduledTimeline);
  const reducedSummary =
    input.scheduledReducedMotionTimeline !== undefined
      ? summarizeScheduledTimeline(input.scheduledReducedMotionTimeline)
      : undefined;

  return {
    trackCount: input.scheduledTimeline.source.tracks.length,
    taskCount: mainSummary.taskCount,
    totalDuration: input.scheduledTimeline.totalDuration,
    hasInfiniteDuration: mainSummary.hasInfiniteDuration,
    infiniteTaskCount: mainSummary.infiniteTaskCount,
    hasReducedMotionTimeline: input.scheduledReducedMotionTimeline !== undefined,
    ...(input.scheduledReducedMotionTimeline !== undefined
      ? {
          reducedMotionTotalDuration: input.scheduledReducedMotionTimeline.totalDuration,
          reducedMotionHasInfiniteDuration: reducedSummary?.hasInfiniteDuration ?? false,
          reducedMotionInfiniteTaskCount: reducedSummary?.infiniteTaskCount ?? 0
        }
      : {})
  };
}

function summarizeScheduledTimeline(timeline: ScheduledMotionTimeline): {
  readonly taskCount: number;
  readonly hasInfiniteDuration: boolean;
  readonly infiniteTaskCount: number;
} {
  const infiniteTaskCount = timeline.tasks.filter(
    (task) => !Number.isFinite(task.endTime) || !Number.isFinite(task.step.activeDuration)
  ).length;

  return {
    taskCount: timeline.tasks.length,
    hasInfiniteDuration: !Number.isFinite(timeline.totalDuration) || infiniteTaskCount > 0,
    infiniteTaskCount
  };
}
