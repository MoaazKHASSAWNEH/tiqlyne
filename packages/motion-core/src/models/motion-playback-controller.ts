import type { MotionPlaybackEventListener, MotionPlaybackEventType } from './motion-playback-event';
import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionPlaybackState } from './motion-playback-state';

/**
 * Runtime status of a playback controller.
 *
 * This status describes the lifecycle of a controllable playback instance.
 * It is intentionally broader than {@link MotionPlaybackStatus} because a
 * controller can also start in an `idle` state before playback has actually run.
 */
export type MotionPlaybackControllerStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'finished'
  | 'cancelled'
  | 'failed'
  | 'skipped';

/**
 * Public controller used to observe and control a running playback.
 *
 * Controllers are returned by engine methods such as `createPlayback`,
 * `createTimelinePlayback` and `createCompositionPlayback`.
 *
 * A driver can provide a native controller implementation. When it does not,
 * the engine falls back to a promise-based controller that exposes the same
 * API but may skip unsupported operations such as seek or playback-rate changes.
 */
export interface MotionPlaybackController {
  /**
   * Stable identifier for this playback instance.
   */
  readonly id: string;

  /**
   * Current lifecycle status.
   */
  readonly status: MotionPlaybackControllerStatus;

  /**
   * Whether the controller has been disposed.
   *
   * A disposed controller no longer stores event listeners.
   */
  readonly disposed: boolean;

  /**
   * Promise resolved when playback reaches a terminal or meaningful result.
   *
   * Drivers decide how this promise maps to the underlying runtime.
   */
  readonly finished: Promise<MotionPlaybackResult>;

  /**
   * Reads the latest known playback state.
   *
   * @returns Current playback state snapshot.
   */
  getState(): MotionPlaybackState;

  /**
   * Moves playback to an absolute time in milliseconds.
   *
   * Controllers that cannot seek should return a skipped result with diagnostics.
   *
   * @param time - Absolute time in milliseconds.
   * @returns Result of the seek operation.
   */
  seek(time: number): Promise<MotionPlaybackResult>;

  /**
   * Moves playback to a progress ratio.
   *
   * Values are expected as a ratio where `0` means start and `1` means end.
   * Implementations may clamp values outside this range.
   *
   * @param progress - Progress ratio.
   * @returns Result of the seek operation.
   */
  seekProgress(progress: number): Promise<MotionPlaybackResult>;

  /**
   * Moves playback to a named timeline label.
   *
   * @param label - Label name defined on the timeline.
   * @returns Result of the label jump operation.
   */
  jumpToLabel(label: string): Promise<MotionPlaybackResult>;

  /**
   * Plays or resumes the playback in the forward direction.
   *
   * @returns Result of the direction change operation.
   */
  playForward(): Promise<MotionPlaybackResult>;

  /**
   * Plays or resumes the playback in the backward direction.
   *
   * @returns Result of the direction change operation.
   */
  playBackward(): Promise<MotionPlaybackResult>;

  /**
   * Changes the playback speed while preserving the current direction.
   *
   * @param rate - Positive playback rate. For example, `1` is normal speed and `2` is double speed.
   * @returns Result of the playback-rate change operation.
   */
  setPlaybackRate(rate: number): Promise<MotionPlaybackResult>;

  /**
   * Pauses playback when supported.
   *
   * @returns Result of the pause operation.
   */
  pause(): Promise<MotionPlaybackResult>;

  /**
   * Resumes playback when supported.
   *
   * @returns Result of the resume operation.
   */
  resume(): Promise<MotionPlaybackResult>;

  /**
   * Cancels playback when supported.
   *
   * @returns Result of the cancel operation.
   */
  cancel(): Promise<MotionPlaybackResult>;

  /**
   * Finishes playback when supported.
   *
   * Infinite animations may not support finish and should return a skipped result.
   *
   * @returns Result of the finish operation.
   */
  finish(): Promise<MotionPlaybackResult>;

  /**
   * Subscribes to a playback event.
   *
   * @param type - Event type to listen to.
   * @param listener - Listener called when the event is emitted.
   * @returns Function that removes the listener.
   */
  on(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;

  /**
   * Subscribes to a playback event once.
   *
   * The listener is removed automatically after the first matching event.
   *
   * @param type - Event type to listen to.
   * @param listener - Listener called once when the event is emitted.
   * @returns Function that removes the listener before it is called.
   */
  once(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;

  /**
   * Disposes the controller event subscriptions.
   *
   * Disposing a controller does not necessarily cancel the underlying animation.
   */
  dispose(): void;
}
