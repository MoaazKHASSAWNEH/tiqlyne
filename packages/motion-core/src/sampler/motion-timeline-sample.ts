import type { MotionKeyframe } from '../models/motion-keyframe';
import type { MotionTargetReference } from '../models/motion-target';

export type MotionTimelineSampleInput =
  | {
      readonly time: number;
      readonly progress?: never;
    }
  | {
      readonly time?: never;
      readonly progress: number;
    };

export type MotionSampleStepStatus = 'pending' | 'active' | 'completed';

export type MotionTimelineSample = {
  readonly time: number;
  readonly progress: number;
  readonly duration: number;
  readonly tracks: ReadonlyArray<MotionTimelineTrackSample>;
  readonly activeSteps: ReadonlyArray<MotionTimelineStepSample>;
  readonly completedSteps: ReadonlyArray<MotionTimelineStepSample>;
  readonly pendingSteps: ReadonlyArray<MotionTimelineStepSample>;
};

export type MotionTimelineTrackSample = {
  readonly trackIndex: number;
  readonly target: MotionTargetReference;
  readonly steps: ReadonlyArray<MotionTimelineStepSample>;
};

export type MotionTimelineStepSample = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly status: MotionSampleStepStatus;
  readonly startTime: number;
  readonly endTime: number;
  readonly localTime: number;
  readonly progress: number;
  readonly keyframe: MotionKeyframe;
};
