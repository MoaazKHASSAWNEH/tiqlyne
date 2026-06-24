export type MotionExecutionPlanSummary = {
  readonly trackCount: number;
  readonly taskCount: number;
  readonly totalDuration: number;
  readonly hasInfiniteDuration: boolean;
  readonly infiniteTaskCount: number;
  readonly hasReducedMotionTimeline: boolean;
  readonly reducedMotionTotalDuration?: number;
  readonly reducedMotionHasInfiniteDuration?: boolean;
  readonly reducedMotionInfiniteTaskCount?: number;
};
