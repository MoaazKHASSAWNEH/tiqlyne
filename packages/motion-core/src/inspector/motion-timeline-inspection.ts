import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionTargetReference } from '../models/motion-target';

/**
 * High-level inspection report for a motion timeline.
 *
 * The inspection API is useful for developer tools, builder previews,
 * documentation, validation reports and debugging.
 */
export type MotionTimelineInspection = {
  /**
   * Total prepared timeline duration in milliseconds.
   */
  readonly totalDuration: number;

  /**
   * Number of tracks in the timeline.
   */
  readonly trackCount: number;

  /**
   * Total number of steps across all tracks.
   */
  readonly stepCount: number;

  /**
   * Number of labels declared on the timeline.
   */
  readonly labelCount: number;

  /**
   * Sorted timeline labels.
   */
  readonly labels: ReadonlyArray<MotionTimelineLabelInspection>;

  /**
   * Unique targets used by the timeline.
   */
  readonly targets: ReadonlyArray<MotionTargetReference>;

  /**
   * Unique animated properties used across all keyframes.
   */
  readonly animatedProperties: ReadonlyArray<string>;

  /**
   * Per-track inspection details.
   */
  readonly tracks: ReadonlyArray<MotionTimelineTrackInspection>;

  /**
   * Diagnostics produced by the inspector.
   */
  readonly diagnostics: ReadonlyArray<MotionDiagnostic>;
};

/**
 * Inspection information for one timeline label.
 */
export type MotionTimelineLabelInspection = {
  /**
   * Label name.
   */
  readonly name: string;

  /**
   * Label time in milliseconds.
   */
  readonly time: number;
};

/**
 * Inspection information for one prepared timeline track.
 */
export type MotionTimelineTrackInspection = {
  /**
   * Track index.
   */
  readonly trackIndex: number;

  /**
   * Track target.
   */
  readonly target: MotionTargetReference;

  /**
   * Number of steps in the track.
   */
  readonly stepCount: number;

  /**
   * Unique animated properties used by this track.
   */
  readonly animatedProperties: ReadonlyArray<string>;

  /**
   * Per-step inspection details.
   */
  readonly steps: ReadonlyArray<MotionTimelineStepInspection>;
};

/**
 * Inspection information for one prepared timeline step.
 */
export type MotionTimelineStepInspection = {
  /**
   * Parent track index.
   */
  readonly trackIndex: number;

  /**
   * Step index inside the parent track.
   */
  readonly stepIndex: number;

  /**
   * Absolute start time in milliseconds.
   */
  readonly startTime: number;

  /**
   * Absolute end time in milliseconds.
   */
  readonly endTime: number;

  /**
   * Step duration in milliseconds.
   */
  readonly duration: number;

  /**
   * Step delay in milliseconds.
   */
  readonly delay: number;

  /**
   * Duration including iterations.
   */
  readonly activeDuration: number;

  /**
   * Number of iterations or `infinite`.
   */
  readonly iterations: number | 'infinite';

  /**
   * Unique animated properties used by this step.
   */
  readonly animatedProperties: ReadonlyArray<string>;

  /**
   * Number of keyframes in this step.
   */
  readonly keyframeCount: number;

  /**
   * Whether this step has infinite playback.
   */
  readonly infinite: boolean;
};
