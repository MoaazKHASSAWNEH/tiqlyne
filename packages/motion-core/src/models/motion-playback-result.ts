import type { MotionDiagnostic } from './motion-diagnostic';

export type MotionPlaybackStatus =
  | 'finished'
  | 'cancelled'
  | 'skipped'
  | 'failed'
  | 'paused'
  | 'running';

export type MotionPlaybackResult = {
  readonly status: MotionPlaybackStatus;
  readonly reason?: string;
  readonly error?: unknown;
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};
