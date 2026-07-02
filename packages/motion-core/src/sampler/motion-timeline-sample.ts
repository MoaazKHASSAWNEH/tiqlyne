import type { MotionKeyframe } from '../models/motion-keyframe';
import type { MotionTargetReference } from '../models/motion-target';

/**
 * Input accepted by the timeline sampler.
 *
 * A timeline can be sampled either at an absolute time in milliseconds or at a
 * progress ratio between `0` and `1`.
 */
export type MotionTimelineSampleInput =
  | {
      /**
       * Absolute time in milliseconds.
       */
      readonly time: number;

      readonly progress?: never;
    }
  | {
      readonly time?: never;

      /**
       * Progress ratio where `0` means timeline start and `1` means timeline end.
       */
      readonly progress: number;
    };

/**
 * Status of a sampled step at a specific timeline time.
 */
export type MotionSampleStepStatus = 'pending' | 'active' | 'completed';

/**
 * Snapshot of a full timeline at a specific time or progress.
 *
 * The sampler is useful for previews, timeline inspectors, tests and playback
 * controllers that need to know which steps are active.
 */
export type MotionTimelineSample = {
  /**
   * Resolved sample time in milliseconds.
   */
  readonly time: number;

  /**
   * Resolved sample progress ratio.
   */
  readonly progress: number;

  /**
   * Total timeline duration in milliseconds.
   */
  readonly duration: number;

  /**
   * Track samples included in the timeline sample.
   */
  readonly tracks: ReadonlyArray<MotionTimelineTrackSample>;

  /**
   * Steps that are active at the sampled time.
   */
  readonly activeSteps: ReadonlyArray<MotionTimelineStepSample>;

  /**
   * Steps that are completed at the sampled time.
   */
  readonly completedSteps: ReadonlyArray<MotionTimelineStepSample>;

  /**
   * Steps that have not started yet at the sampled time.
   */
  readonly pendingSteps: ReadonlyArray<MotionTimelineStepSample>;
};

/**
 * Snapshot of one timeline track at a sampled time.
 */
export type MotionTimelineTrackSample = {
  /**
   * Index of the sampled track in the prepared timeline.
   */
  readonly trackIndex: number;

  /**
   * Target associated with the sampled track.
   */
  readonly target: MotionTargetReference;

  /**
   * Step samples for this track.
   */
  readonly steps: ReadonlyArray<MotionTimelineStepSample>;
};

/**
 * Snapshot of one timeline step at a sampled time.
 */
export type MotionTimelineStepSample = {
  /**
   * Index of the parent track.
   */
  readonly trackIndex: number;

  /**
   * Index of the sampled step inside its track.
   */
  readonly stepIndex: number;

  /**
   * Step status at the sampled time.
   */
  readonly status: MotionSampleStepStatus;

  /**
   * Absolute step start time in milliseconds.
   */
  readonly startTime: number;

  /**
   * Absolute step end time in milliseconds.
   */
  readonly endTime: number;

  /**
   * Local time inside the step in milliseconds.
   */
  readonly localTime: number;

  /**
   * Step-local progress ratio.
   */
  readonly progress: number;

  /**
   * Interpolated or resolved keyframe for the sampled progress.
   */
  readonly keyframe: MotionKeyframe;
};
