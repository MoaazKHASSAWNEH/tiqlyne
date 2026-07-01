import type { MotionPlaybackControllerStatus } from './motion-playback-controller';
import type { MotionPlaybackEventType } from './motion-playback-event-type';
import type { MotionPlaybackResult } from './motion-playback-result';
import type { MotionPlaybackState } from './motion-playback-state';

export type { MotionPlaybackEventType } from './motion-playback-event-type';

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
