export type MotionExecutionPlanSummary = {
  readonly trackCount: number;
  readonly taskCount: number;
  readonly totalDuration: number;
  readonly hasReducedMotionTimeline: boolean;
  readonly reducedMotionTotalDuration?: number;
};
