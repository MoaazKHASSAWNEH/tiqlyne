import { describe, expect, it } from 'vitest';
import { isTerminalPlaybackStatus } from './is-terminal-playback-status';

describe('isTerminalPlaybackStatus', () => {
  it.each(['finished', 'cancelled', 'failed', 'skipped'] as const)(
    'returns true for %s',
    (status) => {
      expect(isTerminalPlaybackStatus(status)).toBe(true);
    }
  );

  it.each(['idle', 'running', 'paused'] as const)('returns false for %s', (status) => {
    expect(isTerminalPlaybackStatus(status)).toBe(false);
  });
});
