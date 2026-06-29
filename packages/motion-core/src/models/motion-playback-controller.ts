import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionPlaybackEventListener, MotionPlaybackEventType } from './motion-playback-event';
import type { MotionPlaybackState } from './motion-playback-state';

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
  readonly disposed: boolean;
  readonly finished: Promise<MotionPlaybackResult>;
  
  getState(): MotionPlaybackState;
  pause(): Promise<MotionPlaybackResult>;
  resume(): Promise<MotionPlaybackResult>;
  cancel(): Promise<MotionPlaybackResult>;
  finish(): Promise<MotionPlaybackResult>;

  on(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;
  once(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;
  dispose(): void;
}
