import { describe, expect, it } from 'vitest';
import {
  createPlaybackInvalidInputDiagnostic,
  createPlaybackInvalidTransitionDiagnostic,
  createPlaybackOperationFailedDiagnostic,
  createPlaybackUnsupportedDiagnostic
} from './create-playback-diagnostic';
import { MotionDiagnosticSources } from './motion-diagnostic-source';

describe('playback diagnostics', () => {
  it('creates invalid transition diagnostics', () => {
    expect(
      createPlaybackInvalidTransitionDiagnostic(
        'seek',
        'finished',
        MotionDiagnosticSources.PromisePlaybackController
      )
    ).toEqual({
      level: 'warning',
      code: 'playback-invalid-transition',
      message: 'Cannot run "seek" while playback is "finished".',
      source: 'promise-motion-playback-controller',
      metadata: {
        action: 'seek',
        currentStatus: 'finished'
      }
    });
  });

  it('creates playback unsupported diagnostics', () => {
    expect(
      createPlaybackUnsupportedDiagnostic(
        'playback-seek-not-supported',
        'This playback controller does not support seek(time).',
        MotionDiagnosticSources.PromisePlaybackController,
        {
          time: 100
        }
      )
    ).toMatchObject({
      level: 'warning',
      code: 'playback-seek-not-supported',
      source: 'promise-motion-playback-controller',
      metadata: {
        time: 100
      }
    });
  });

  it('creates invalid input and failure diagnostics', () => {
    expect(
      createPlaybackInvalidInputDiagnostic(
        'playback-invalid-input',
        'Invalid input.',
        MotionDiagnosticSources.PromisePlaybackController
      )
    ).toMatchObject({
      level: 'warning',
      code: 'playback-invalid-input'
    });

    expect(
      createPlaybackOperationFailedDiagnostic(
        'playback-operation-failed',
        'Operation failed.',
        MotionDiagnosticSources.PromisePlaybackController
      )
    ).toMatchObject({
      level: 'error',
      code: 'playback-operation-failed'
    });
  });
});
