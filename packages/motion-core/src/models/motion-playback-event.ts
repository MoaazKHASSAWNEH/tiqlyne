import type { MotionPlaybackControllerStatus } from './motion-playback-controller';
import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionPlaybackState } from './motion-playback-state';

export type MotionPlaybackEventType =
  | 'start'
  | 'statusChange'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'finish'
  | 'skip'
  | 'fail'
  | 'seek'
  | 'progress'
  | 'playbackRateChange'
  | 'directionChange';

export type MotionPlaybackEvent = {
  readonly type: MotionPlaybackEventType;
  readonly playbackId: string;
  readonly state?: MotionPlaybackState;
  readonly status: MotionPlaybackControllerStatus;
  readonly previousStatus: MotionPlaybackControllerStatus;
  readonly timestamp: number;
  readonly result?: MotionPlaybackResult;
};

export type MotionPlaybackEventListener = (event: MotionPlaybackEvent) => void;
