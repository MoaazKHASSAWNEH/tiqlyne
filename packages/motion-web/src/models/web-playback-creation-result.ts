import type { MotionPlaybackResult } from '@structifyx/motion-core';

export type WebPlaybackCreationResult = {
  readonly animations: ReadonlyArray<Animation>;
  readonly finished: Promise<MotionPlaybackResult>;
};
