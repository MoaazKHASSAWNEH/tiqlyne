import type { MotionDiagnostic } from './motion-diagnostic';

export type MotionPlaybackStatus = 'finished' | 'cancelled' | 'skipped' | 'failed';

export type MotionPlaybackResult = {
  readonly status: MotionPlaybackStatus;
  readonly reason?: string;
  readonly error?: unknown;
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};
