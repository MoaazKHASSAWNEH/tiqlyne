import type { MotionDiagnostic } from '@tiqlyne/motion-core';
import { describe, expect, it } from 'vitest';
import {
  createFailedWebPlayback,
  createFinishedWebPlayback,
  createResolvedWebPlayback,
  createRunningWebPlayback,
  createSkippedWebPlayback
} from './create-web-playback-result';

describe('createResolvedWebPlayback', () => {
  it('creates a resolved playback result', async () => {
    const playback = createResolvedWebPlayback({
      status: 'skipped',
      reason: 'test'
    });

    await expect(playback.finished).resolves.toEqual({
      status: 'skipped',
      reason: 'test'
    });

    expect(playback.animations).toEqual([]);
  });
});

describe('createRunningWebPlayback', () => {
  it('creates a running playback result', async () => {
    const animations = [
      {
        finished: new Promise<void>(() => {})
      }
    ] as unknown as ReadonlyArray<Animation>;

    const playback = createRunningWebPlayback(animations);

    await expect(playback.finished).resolves.toEqual({
      status: 'running',
      reason: 'web-playback-infinite'
    });

    expect(playback.animations).toBe(animations);
  });

  it('supports a custom running reason', async () => {
    const playback = createRunningWebPlayback([], 'custom-running-reason');

    await expect(playback.finished).resolves.toEqual({
      status: 'running',
      reason: 'custom-running-reason'
    });

    expect(playback.animations).toEqual([]);
  });
});

describe('createFailedWebPlayback', () => {
  it('creates a failed playback result', async () => {
    const playback = createFailedWebPlayback('target-not-found');

    await expect(playback.finished).resolves.toEqual({
      status: 'failed',
      reason: 'target-not-found'
    });

    expect(playback.animations).toEqual([]);
  });

  it('supports extra failed playback fields', async () => {
    const diagnostic: MotionDiagnostic = {
      level: 'error',
      code: 'test-diagnostic',
      message: 'Test diagnostic',
      source: 'test'
    };

    const playback = createFailedWebPlayback('invalid-timeline', [], {
      diagnostics: [diagnostic]
    });

    await expect(playback.finished).resolves.toEqual({
      status: 'failed',
      reason: 'invalid-timeline',
      diagnostics: [diagnostic]
    });
  });
});

describe('createSkippedWebPlayback', () => {
  it('creates a skipped playback result', async () => {
    const playback = createSkippedWebPlayback('reduced-motion');

    await expect(playback.finished).resolves.toEqual({
      status: 'skipped',
      reason: 'reduced-motion'
    });

    expect(playback.animations).toEqual([]);
  });
});

describe('createFinishedWebPlayback', () => {
  it('resolves when all animations are finished', async () => {
    const animations = [
      {
        finished: Promise.resolve()
      },
      {
        finished: Promise.resolve()
      }
    ] as unknown as ReadonlyArray<Animation>;

    const playback = createFinishedWebPlayback(animations);

    await expect(playback.finished).resolves.toEqual({
      status: 'finished'
    });

    expect(playback.animations).toBe(animations);
  });

  it('includes diagnostics when provided', async () => {
    const diagnostic: MotionDiagnostic = {
      level: 'warning',
      code: 'test-warning',
      message: 'Test warning',
      source: 'test'
    };

    const animations = [
      {
        finished: Promise.resolve()
      }
    ] as unknown as ReadonlyArray<Animation>;

    const playback = createFinishedWebPlayback(animations, [diagnostic]);

    await expect(playback.finished).resolves.toEqual({
      status: 'finished',
      diagnostics: [diagnostic]
    });
  });
});
