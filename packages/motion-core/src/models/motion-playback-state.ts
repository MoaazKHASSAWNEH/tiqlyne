import type { MotionPlaybackControllerStatus } from './motion-playback-controller';

/**
 * Current playback direction.
 */
export type MotionPlaybackDirectionState = 'forward' | 'backward';

/**
 * Snapshot of a playback controller state.
 *
 * The state is read on demand through `MotionPlaybackController.getState()`.
 * Some values may be `null` when the underlying driver cannot resolve them.
 */
export type MotionPlaybackState = {
  /**
   * Current lifecycle status of the controller.
   */
  readonly status: MotionPlaybackControllerStatus;

  /**
   * Current playback time in milliseconds, or `null` when unavailable.
   */
  readonly currentTime: number | null;

  /**
   * Total playback duration in milliseconds, or `null` when unavailable.
   */
  readonly duration: number | null;

  /**
   * Current progress ratio between `0` and `1`, or `null` when unavailable.
   */
  readonly progress: number | null;

  /**
   * Current playback rate.
   *
   * A value of `1` means normal speed.
   */
  readonly playbackRate: number;

  /**
   * Current playback direction.
   */
  readonly direction: MotionPlaybackDirectionState;

  /**
   * Track indexes that are active at the current playback time.
   */
  readonly activeTrackIndexes: ReadonlyArray<number>;

  /**
   * Step indexes that are active at the current playback time.
   */
  readonly activeStepIndexes: ReadonlyArray<number>;

  /**
   * Current timeline label, when the controller can resolve one.
   */
  readonly currentLabel?: string;
};
