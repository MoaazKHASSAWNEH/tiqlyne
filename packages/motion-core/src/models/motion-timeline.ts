import type { MotionEasing } from './motion-easing';
import type { MotionKeyframe } from './motion-keyframe';
import type { MotionTargetReference } from './motion-target';

/**
 * Origin used to calculate stagger delays across multiple resolved targets.
 */
export type MotionStaggerFrom = 'start' | 'end' | 'center';

/**
 * Stagger configuration applied when a track resolves to multiple targets.
 *
 * A number means a fixed delay, in milliseconds, between each resolved target.
 * An object allows configuring both the delay and the origin.
 */
export type MotionStaggerDefinition =
  | number
  | {
      /**
       * Delay in milliseconds between each resolved target.
       */
      readonly each: number;

      /**
       * Origin used to calculate stagger order.
       */
      readonly from?: MotionStaggerFrom;
    };

/**
 * Fill behavior applied after or before a motion step.
 *
 * This maps conceptually to Web Animations API fill modes while remaining
 * independent from the DOM in the core package.
 */
export type MotionFillMode = 'none' | 'forwards' | 'backwards' | 'both' | 'auto';

/**
 * Named timeline labels mapped to absolute times in milliseconds.
 */
export type MotionTimelineLabels = Readonly<Record<string, number>>;

/**
 * Step position resolved from a named timeline label.
 */
export type MotionLabelStepPosition = {
  /**
   * Timeline label name.
   */
  readonly label: string;

  /**
   * Optional offset in milliseconds from the label time.
   */
  readonly offset?: number;
};

/**
 * Anchor used to position a step relative to the current track timeline.
 */
export type MotionStepAnchor = 'track-start' | 'track-end' | 'previous-start' | 'previous-end';

/**
 * Step position resolved from a timeline anchor.
 */
export type MotionAnchorStepPosition = {
  /**
   * Anchor used as the base position.
   */
  readonly anchor: MotionStepAnchor;

  /**
   * Optional offset in milliseconds from the anchor.
   */
  readonly offset?: number;
};

/**
 * Position of a motion step.
 *
 * A number represents an absolute time in milliseconds. A string can be used by
 * higher-level APIs as a shorthand label. Object forms allow explicit label or
 * anchor positioning.
 */
export type MotionStepPosition =
  | number
  | string
  | MotionLabelStepPosition
  | MotionAnchorStepPosition;

/**
 * Playback direction for a motion step.
 */
export type MotionPlaybackDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

/**
 * Number of iterations for a motion step.
 */
export type MotionIterationCount = number | 'infinite';

/**
 * Defaults that can be applied at timeline or track level.
 *
 * Step-level values override track defaults, and track defaults override
 * timeline defaults.
 */
export type MotionTimelineDefaults = {
  /**
   * Default number of iterations.
   */
  readonly iterations?: MotionIterationCount;

  /**
   * Default playback direction.
   */
  readonly direction?: MotionPlaybackDirection;

  /**
   * Shortcut for alternate direction behavior.
   */
  readonly yoyo?: boolean;

  /**
   * Default delay after a step completes.
   */
  readonly endDelay?: number;

  /**
   * Default duration in milliseconds.
   */
  readonly duration?: number;

  /**
   * Default delay before a step starts.
   */
  readonly delay?: number;

  /**
   * Default easing.
   */
  readonly easing?: MotionEasing;

  /**
   * Default fill mode.
   */
  readonly fill?: MotionFillMode;

  /**
   * Default playback rate.
   */
  readonly playbackRate?: number;
};

/**
 * One animation step inside a track.
 *
 * Steps are prepared and scheduled by the core before being passed to a driver.
 */
export type MotionStepDefinition = {
  /**
   * Number of times the step should repeat.
   */
  readonly iterations?: MotionIterationCount;

  /**
   * Playback direction for this step.
   */
  readonly direction?: MotionPlaybackDirection;

  /**
   * Shortcut for alternate direction behavior.
   */
  readonly yoyo?: boolean;

  /**
   * Delay after this step completes.
   */
  readonly endDelay?: number;

  /**
   * Playback rate for this step.
   */
  readonly playbackRate?: number;

  /**
   * Optional position of the step in the track.
   */
  readonly at?: MotionStepPosition;

  /**
   * Keyframes that describe the visual states of this step.
   */
  readonly keyframes: ReadonlyArray<MotionKeyframe>;

  /**
   * Step duration in milliseconds.
   */
  readonly duration?: number;

  /**
   * Delay before the step starts.
   */
  readonly delay?: number;

  /**
   * Step easing.
   */
  readonly easing?: MotionEasing;

  /**
   * Legacy or low-level offset value used by drivers and tooling.
   */
  readonly offset?: number;

  /**
   * Fill mode applied to this step.
   */
  readonly fill?: MotionFillMode;
};

/**
 * Track targeting one or more runtime elements.
 *
 * Tracks are parallel by default, while steps inside a track are usually
 * scheduled sequentially unless explicit positions are used.
 */
export type MotionTrackDefinition = {
  /**
   * Target reference resolved by the active driver.
   */
  readonly target: MotionTargetReference;

  /**
   * Steps belonging to this track.
   */
  readonly steps: ReadonlyArray<MotionStepDefinition>;

  /**
   * Optional stagger behavior when the target resolves to multiple elements.
   */
  readonly stagger?: MotionStaggerDefinition;

  /**
   * Defaults applied to steps in this track.
   */
  readonly defaults?: MotionTimelineDefaults;
};

/**
 * Declarative timeline consumed by the motion engine.
 *
 * A timeline is framework-agnostic and does not depend on the DOM. Drivers are
 * responsible for resolving targets and executing the resulting steps.
 */
export type MotionTimelineDefinition = {
  /**
   * Tracks included in the timeline.
   */
  readonly tracks: ReadonlyArray<MotionTrackDefinition>;

  /**
   * Defaults applied to all tracks and steps unless overridden.
   */
  readonly defaults?: MotionTimelineDefaults;

  /**
   * Optional labels that can be used for seeking, jump-to-label and composition.
   */
  readonly labels?: MotionTimelineLabels;
};
