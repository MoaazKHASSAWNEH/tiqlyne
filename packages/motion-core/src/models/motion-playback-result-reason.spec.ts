import { describe, expect, it } from 'vitest';
import { MotionPlaybackResultReasons } from './motion-playback-result-reason';

describe('MotionPlaybackResultReasons', () => {
  it('exposes stable playback result reason constants', () => {
    expect(MotionPlaybackResultReasons.PlaybackSeekInvalidTime).toBe('playback-seek-invalid-time');
    expect(MotionPlaybackResultReasons.WebPlaybackSeek).toBe('web-playback-seek');
    expect(MotionPlaybackResultReasons.WebPlaybackFinishFailed).toBe('web-playback-finish-failed');
  });
});
