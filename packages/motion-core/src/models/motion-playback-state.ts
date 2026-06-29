import type { MotionPlaybackControllerStatus } from './motion-playback-controller';

export type MotionPlaybackDirectionState = 'forward' | 'backward';

export type MotionPlaybackState = {
  readonly status: MotionPlaybackControllerStatus;
  readonly currentTime: number | null;
  readonly duration: number | null;
  readonly progress: number | null;
  readonly playbackRate: number;
  readonly direction: MotionPlaybackDirectionState;
  readonly activeTrackIndexes: ReadonlyArray<number>;
  readonly activeStepIndexes: ReadonlyArray<number>;
  readonly currentLabel?: string;
};