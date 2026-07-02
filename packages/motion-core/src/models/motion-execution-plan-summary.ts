/**
 * Lightweight summary of an execution plan.
 *
 * The summary is useful for debugging, documentation, builder previews and
 * runtime decisions without inspecting the full prepared or scheduled timelines.
 */
export type MotionExecutionPlanSummary = {
  /**
   * Number of tracks in the main scheduled timeline.
   */
  readonly trackCount: number;

  /**
   * Number of scheduled tasks in the main timeline.
   */
  readonly taskCount: number;

  /**
   * Total duration of the main timeline in milliseconds.
   */
  readonly totalDuration: number;

  /**
   * Whether the main timeline has infinite duration.
   */
  readonly hasInfiniteDuration: boolean;

  /**
   * Number of infinite tasks in the main timeline.
   */
  readonly infiniteTaskCount: number;

  /**
   * Whether the plan includes a reduced-motion timeline.
   */
  readonly hasReducedMotionTimeline: boolean;

  /**
   * Total duration of the reduced-motion timeline, when available.
   */
  readonly reducedMotionTotalDuration?: number;

  /**
   * Whether the reduced-motion timeline has infinite duration.
   */
  readonly reducedMotionHasInfiniteDuration?: boolean;

  /**
   * Number of infinite tasks in the reduced-motion timeline.
   */
  readonly reducedMotionInfiniteTaskCount?: number;
};
