import type { PreparedMotionStep, PreparedMotionTimeline } from './prepared-motion-timeline';

export type ScheduledMotionTask = {
  readonly taskIndex: number;
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly delay: number;
  readonly step: PreparedMotionStep;
};

export type ScheduledMotionTimeline = {
  readonly source: PreparedMotionTimeline;
  readonly tasks: ReadonlyArray<ScheduledMotionTask>;
  readonly totalDuration: number;
};
