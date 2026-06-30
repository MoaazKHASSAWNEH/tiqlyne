import { describe, expect, it } from 'vitest';
import { MotionDiagnosticCodes } from './motion-diagnostic-code';

describe('MotionDiagnosticCodes', () => {
  it('exposes stable diagnostic code constants', () => {
    expect(MotionDiagnosticCodes.PlaybackInvalidTransition).toBe('playback-invalid-transition');
    expect(MotionDiagnosticCodes.WebPlaybackSeekFailed).toBe('web-playback-seek-failed');
    expect(MotionDiagnosticCodes.TimelineInspectionLongStep).toBe('timeline-inspection-long-step');
  });
});
