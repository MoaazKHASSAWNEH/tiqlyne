import type { MotionKeyframe } from './motion-keyframe';
import type { MotionTargetReference } from './motion-target';
import type {
  MotionStepDefinition,
  MotionStaggerDefinition,
  MotionTimelineDefinition
} from './motion-timeline';

export type PreparedMotionStep = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly delay: number;
  readonly keyframes: ReadonlyArray<MotionKeyframe>;
  readonly easing?: string;
  readonly offset?: number;
  readonly fill?: MotionStepDefinition['fill'];
  readonly source: MotionStepDefinition;
};

export type PreparedMotionTrack = {
  readonly trackIndex: number;
  readonly target: MotionTargetReference;
  readonly steps: ReadonlyArray<PreparedMotionStep>;
  readonly duration: number;
  readonly stagger?: MotionStaggerDefinition;
};

export type PreparedMotionTimeline = {
  readonly source: MotionTimelineDefinition;
  readonly tracks: ReadonlyArray<PreparedMotionTrack>;
  readonly totalDuration: number;
};
