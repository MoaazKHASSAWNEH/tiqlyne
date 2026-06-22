import type { MotionKeyframe } from './motion-keyframe';
import type { MotionTargetReference } from './motion-target';

export type MotionStaggerFrom = 'start' | 'end' | 'center';

export type MotionStaggerDefinition =
  | number
  | {
      readonly each: number;
      readonly from?: MotionStaggerFrom;
    };

export type MotionStepDefinition = {
  readonly keyframes: ReadonlyArray<MotionKeyframe>;
  readonly duration: number;
  readonly delay?: number;
  readonly easing?: string;
  readonly offset?: number;
  readonly fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
};

export type MotionTrackDefinition = {
  readonly target: MotionTargetReference;
  readonly steps: ReadonlyArray<MotionStepDefinition>;
  readonly stagger?: MotionStaggerDefinition;
};

export type MotionTimelineDefinition = {
  readonly tracks: ReadonlyArray<MotionTrackDefinition>;
};
