import { describe, expect, it } from 'vitest';
import { validateMotionTimeline } from './validate-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

describe('validateMotionTimeline', () => {
  it('accepts a valid timeline', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
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
    });

    expect(result).toEqual({
      valid: true,
      diagnostics: []
    });
  });

  it('rejects empty tracks', () => {
    const result = validateMotionTimeline({
      tracks: []
    });

    expect(result).toMatchObject({
      valid: false,
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-tracks',
          source: 'motion-timeline-validator'
        }
      ]
    });
  });

  it('rejects empty steps', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: []
        }
      ]
    });

    expect(result).toMatchObject({
      valid: false,
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-steps',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0
          }
        }
      ]
    });
  });

  it('rejects empty keyframes', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              keyframes: []
            }
          ]
        }
      ]
    });

    expect(result).toMatchObject({
      valid: false,
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-empty-keyframes',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0,
            stepIndex: 0
          }
        }
      ]
    });
  });

  it('rejects invalid duration', () => {
    const result = validateMotionTimeline({
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
    });

    expect(result).toMatchObject({
      valid: false,
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-invalid-duration',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0,
            stepIndex: 0,
            duration: -1
          }
        }
      ]
    });
  });

  it('rejects invalid target selector', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'selector',
            selector: ''
          },
          steps: [
            {
              duration: 300,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    });

    expect(result).toMatchObject({
      valid: false,
      diagnostics: [
        {
          level: 'error',
          code: 'timeline-invalid-target-selector',
          source: 'motion-timeline-validator',
          metadata: {
            trackIndex: 0
          }
        }
      ]
    });
  });

  it('collects multiple diagnostics', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'selector',
            selector: ''
          },
          steps: [
            {
              duration: -1,
              delay: -1,
              keyframes: [
                {
                  opacity: 2
                }
              ]
            }
          ]
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'timeline-invalid-target-selector',
      'timeline-invalid-opacity',
      'timeline-invalid-duration',
      'timeline-invalid-delay'
    ]);
  });

  it('returns diagnostic when track stagger is invalid', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          stagger: -1,
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-stagger',
        source: 'motion-timeline-validator',
        metadata: {
          trackIndex: 0,
          stagger: -1
        }
      })
    );
  });

  it('returns diagnostic when advanced track stagger each is invalid', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          stagger: {
            each: -1,
            from: 'start'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-stagger',
        source: 'motion-timeline-validator',
        metadata: {
          trackIndex: 0,
          stagger: -1
        }
      })
    );
  });

  it('returns diagnostic when advanced track stagger from is invalid', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          stagger: {
            each: 80,
            from: 'middle'
          },
          steps: [
            {
              duration: 100,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          ]
        }
      ]
    } as unknown as MotionTimelineDefinition);

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-stagger-from',
        source: 'motion-timeline-validator',
        metadata: {
          trackIndex: 0,
          from: 'middle'
        }
      })
    );
  });
});
