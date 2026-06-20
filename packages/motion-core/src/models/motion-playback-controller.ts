import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionPlaybackEventListener, MotionPlaybackEventType } from './motion-playback-event';

export type MotionPlaybackControllerStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'finished'
  | 'cancelled'
  | 'failed'
  | 'skipped';

export interface MotionPlaybackController {
  readonly id: string;
  readonly status: MotionPlaybackControllerStatus;
  readonly finished: Promise<MotionPlaybackResult>;

  pause(): Promise<MotionPlaybackResult>;
  resume(): Promise<MotionPlaybackResult>;
  cancel(): Promise<MotionPlaybackResult>;
  finish(): Promise<MotionPlaybackResult>;
  on(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;

  once(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;
}
