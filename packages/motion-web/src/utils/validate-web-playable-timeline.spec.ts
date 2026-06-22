import type { MotionPlayOptions, MotionTimelineDefinition } from '@structifyx/motion-core';
import { describe, expect, it } from 'vitest';
import {
  shouldValidateWebPlayableTimeline,
  validateWebPlayableTimeline
} from './validate-web-playable-timeline';

const defaultOptions: MotionPlayOptions = {
  trigger: 'manual',
  respectReducedMotion: true,
  reducedMotionStrategy: 'preserve',
  conflictStrategy: 'replace'
};

describe('shouldValidateWebPlayableTimeline', () => {
  it('returns true when regular timeline is not already validated', () => {
    expect(shouldValidateWebPlayableTimeline(defaultOptions, false)).toBe(true);
  });

  it('returns false when regular timeline is already validated', () => {
    expect(
      shouldValidateWebPlayableTimeline(
        {
          ...defaultOptions,
          timelineValidated: true
        },
        false
      )
    ).toBe(false);
  });

  it('uses reduced motion validation flag when simplifying reduced motion', () => {
    expect(
      shouldValidateWebPlayableTimeline(
        {
          ...defaultOptions,
          reducedMotionStrategy: 'simplify',
          timelineValidated: true,
          reducedMotionTimelineValidated: false
        },
        true
      )
    ).toBe(true);
  });

  it('returns false when reduced motion timeline is already validated', () => {
    expect(
      shouldValidateWebPlayableTimeline(
        {
          ...defaultOptions,
          reducedMotionStrategy: 'simplify',
          reducedMotionTimelineValidated: true
        },
        true
      )
    ).toBe(false);
  });
});

describe('validateWebPlayableTimeline', () => {
  it('returns valid when validation is skipped', () => {
    const result = validateWebPlayableTimeline(
      createValidTimeline(),
      {
        ...defaultOptions,
        timelineValidated: true
      },
      false
    );

    expect(result).toEqual({
      valid: true,
      diagnostics: []
    });
  });

  it('validates a valid timeline', () => {
    const result = validateWebPlayableTimeline(createValidTimeline(), defaultOptions, false);

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('returns diagnostics for an invalid timeline', () => {
    const result = validateWebPlayableTimeline(createInvalidTimeline(), defaultOptions, false);

    expect(result.valid).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });
});

function createValidTimeline(): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: 200,
            keyframes: [
              {
                opacity: 0
              },
              {
                opacity: 1
              }
            ]
          }
        ]
      }
    ]
  };
}

function createInvalidTimeline(): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: -1,
            keyframes: [
              {
                opacity: 1
              }
            ]
          }
        ]
      }
    ]
  };
}
