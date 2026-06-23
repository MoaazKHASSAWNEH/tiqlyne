import type { MotionKeyframe } from './motion-keyframe';
import type { MotionTargetReference } from './motion-target';

export type MotionStaggerFrom = 'start' | 'end' | 'center';

export type MotionStaggerDefinition =
  | number
  | {
      readonly each: number;
      readonly from?: MotionStaggerFrom;
    };

export type MotionFillMode = 'none' | 'forwards' | 'backwards' | 'both' | 'auto';

export type MotionTimelineLabels = Readonly<Record<string, number>>;

export type MotionLabelStepPosition = {
  readonly label: string;
  readonly offset?: number;
};

export type MotionStepAnchor = 'track-start' | 'track-end' | 'previous-start' | 'previous-end';

export type MotionAnchorStepPosition = {
  readonly anchor: MotionStepAnchor;
  readonly offset?: number;
};

export type MotionStepPosition =
  | number
  | string
  | MotionLabelStepPosition
  | MotionAnchorStepPosition;

export type MotionPlaybackDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

export type MotionIterationCount = number | 'infinite';

export type MotionTimelineDefaults = {
  readonly iterations?: MotionIterationCount;
  readonly direction?: MotionPlaybackDirection;
  readonly endDelay?: number;
  readonly duration?: number;
  readonly delay?: number;
  readonly easing?: string;
  readonly fill?: MotionFillMode;
  readonly playbackRate?: number;
};

export type MotionStepDefinition = {
  readonly iterations?: MotionIterationCount;
  readonly direction?: MotionPlaybackDirection;
  readonly endDelay?: number;
  readonly playbackRate?: number;
  readonly at?: MotionStepPosition;
  readonly keyframes: ReadonlyArray<MotionKeyframe>;
  readonly duration?: number;
  readonly delay?: number;
  readonly easing?: string;
  readonly offset?: number;
  readonly fill?: MotionFillMode;
};

export type MotionTrackDefinition = {
  readonly target: MotionTargetReference;
  readonly steps: ReadonlyArray<MotionStepDefinition>;
  readonly stagger?: MotionStaggerDefinition;
  readonly defaults?: MotionTimelineDefaults;
};

export type MotionTimelineDefinition = {
  readonly tracks: ReadonlyArray<MotionTrackDefinition>;
  readonly defaults?: MotionTimelineDefaults;
  readonly labels?: MotionTimelineLabels;
};
