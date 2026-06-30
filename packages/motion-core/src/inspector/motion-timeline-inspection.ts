import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTargetReference } from '../models/motion-target';

export type MotionTimelineInspection = {
  readonly totalDuration: number;
  readonly trackCount: number;
  readonly stepCount: number;
  readonly labelCount: number;
  readonly labels: ReadonlyArray<MotionTimelineLabelInspection>;
  readonly targets: ReadonlyArray<MotionTargetReference>;
  readonly animatedProperties: ReadonlyArray<string>;
  readonly tracks: ReadonlyArray<MotionTimelineTrackInspection>;
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};

export type MotionTimelineLabelInspection = {
  readonly name: string;
  readonly time: number;
};

export type MotionTimelineTrackInspection = {
  readonly trackIndex: number;
  readonly target: MotionTargetReference;
  readonly stepCount: number;
  readonly animatedProperties: ReadonlyArray<string>;
  readonly steps: ReadonlyArray<MotionTimelineStepInspection>;
};

export type MotionTimelineStepInspection = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly delay: number;
  readonly activeDuration: number;
  readonly iterations: number | 'infinite';
  readonly animatedProperties: ReadonlyArray<string>;
  readonly keyframeCount: number;
  readonly infinite: boolean;
};
