import type { MotionDiagnostic } from './motion-diagnostic';
import type { MotionPlaybackResultReason } from './motion-playback-result-reason';

export type MotionPlaybackStatus =
  | 'finished'
  | 'cancelled'
  | 'skipped'
  | 'failed'
  | 'paused'
  | 'running';

export type MotionPlaybackResult = {
  readonly status: MotionPlaybackStatus;
  readonly reason?: MotionPlaybackResultReason | string;
  readonly error?: unknown;
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};
