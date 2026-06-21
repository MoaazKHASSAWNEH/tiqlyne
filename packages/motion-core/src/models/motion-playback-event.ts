import type { MotionPlaybackControllerStatus } from './motion-playback-controller';
import type { MotionPlaybackResult } from './motion-playback-result';

export type MotionPlaybackEventType =
  | 'start'
  | 'statusChange'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'finish'
  | 'skip'
  | 'fail';

export type MotionPlaybackEvent = {
  readonly type: MotionPlaybackEventType;
  readonly playbackId: string;
  readonly status: MotionPlaybackControllerStatus;
  readonly previousStatus: MotionPlaybackControllerStatus;
  readonly result?: MotionPlaybackResult;
};

export type MotionPlaybackEventListener = (event: MotionPlaybackEvent) => void;
