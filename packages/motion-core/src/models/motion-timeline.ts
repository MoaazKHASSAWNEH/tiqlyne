import type { MotionKeyframe } from './motion-keyframe';
import type { MotionTargetReference } from './motion-target';

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
};

export type MotionTimelineDefinition = {
  readonly tracks: ReadonlyArray<MotionTrackDefinition>;
};