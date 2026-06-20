import type { MotionPlaybackControllerStatus } from '../models/motion-playback-controller';

export function isTerminalPlaybackStatus(status: MotionPlaybackControllerStatus): boolean {
  return (
    status === 'finished' || status === 'cancelled' || status === 'failed' || status === 'skipped'
  );
}
