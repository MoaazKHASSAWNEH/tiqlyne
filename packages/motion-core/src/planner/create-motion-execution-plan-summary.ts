import type { MotionExecutionPlanSummary } from '../models/motion-execution-plan-summary';
import type { ScheduledMotionTimeline } from '../models/scheduled-motion-timeline';

/**
 * Input used to create an execution plan summary.
 */
export type CreateMotionExecutionPlanSummaryInput = {
  /**
   * Main scheduled timeline to summarize.
   */
  readonly scheduledTimeline: ScheduledMotionTimeline;

  /**
   * Optional reduced-motion scheduled timeline to summarize.
   */
  readonly scheduledReducedMotionTimeline?: ScheduledMotionTimeline;
};

/**
 * Creates a lightweight summary from scheduled timelines.
 *
 * The summary intentionally exposes high-level metrics only: track count, task
 * count, total duration and infinite-duration information. This keeps the public
 * API useful for tooling without forcing callers to inspect scheduled tasks.
 *
 * @param input - Scheduled timelines to summarize.
 * @returns Execution plan summary.
 */
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
