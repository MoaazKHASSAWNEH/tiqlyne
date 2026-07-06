import type { MotionPlaybackResult } from '@tiqlyne/motion-core';

export type WebPlaybackCreationResult = {
  readonly animations: ReadonlyArray<Animation>;
  readonly finished: Promise<MotionPlaybackResult>;
};
