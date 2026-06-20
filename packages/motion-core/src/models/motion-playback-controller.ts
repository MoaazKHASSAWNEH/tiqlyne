import type { MotionPlaybackResult } from './motion-playback-result';

export type MotionPlaybackControllerStatus =
  | 'idle'
  | 'running'
  | 'finished'
  | 'cancelled'
  | 'failed'
  | 'skipped';

export interface MotionPlaybackController {
  readonly id: string;
  readonly status: MotionPlaybackControllerStatus;
  readonly finished: Promise<MotionPlaybackResult>;

  cancel(): Promise<MotionPlaybackResult>;
  finish(): Promise<MotionPlaybackResult>;
}
