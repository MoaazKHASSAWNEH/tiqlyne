import type { MotionPlaybackControllerStatus } from './motion-playback-controller';
import type { MotionPlaybackEventType } from './motion-playback-event-type';
import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionPlaybackState } from './motion-playback-state';

export type { MotionPlaybackEventType } from './motion-playback-event-type';

/**
 * Event emitted by a playback controller.
 *
 * Playback events describe controller lifecycle changes and runtime operations.
 * They can be used for UI updates, debugging, logging or custom observability.
 */
export type MotionPlaybackEvent = {
  /**
   * Playback event type.
   */
  readonly type: MotionPlaybackEventType;

  /**
   * Identifier of the playback controller that emitted the event.
   */
  readonly playbackId: string;

  /**
   * Optional state snapshot associated with the event.
   *
   * Advanced events such as seek, playback-rate change and direction change
   * may include the latest controller state.
   */
  readonly state?: MotionPlaybackState;

  /**
   * Current controller status after the event.
   */
  readonly status: MotionPlaybackControllerStatus;

  /**
   * Previous controller status before the event.
   */
  readonly previousStatus: MotionPlaybackControllerStatus;

  /**
   * Timestamp in milliseconds.
   */
  readonly timestamp: number;

  /**
   * Optional playback result associated with the event.
   */
  readonly result?: MotionPlaybackResult;
};

/**
 * Listener function used by playback controllers.
 */
export type MotionPlaybackEventListener = (event: MotionPlaybackEvent) => void;
