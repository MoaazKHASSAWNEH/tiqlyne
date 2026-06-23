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

  it('accepts steps without duration when timeline default duration is provided', () => {
    const result = validateMotionTimeline({
      defaults: {
        duration: 300
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
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

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('accepts steps without duration when track default duration is provided', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            duration: 200
          },
          steps: [
            {
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

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('rejects steps without duration when no default duration is provided', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
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
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'timeline-invalid-duration'
        })
      ])
    );
  });

  it('rejects invalid timeline default duration', () => {
    const result = validateMotionTimeline({
      defaults: {
        duration: -1
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
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
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'timeline-invalid-default-duration'
        })
      ])
    );
  });

  it('rejects invalid track default delay', () => {
    const result = validateMotionTimeline({
      defaults: {
        duration: 300
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            delay: -1
          },
          steps: [
            {
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
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'timeline-invalid-default-delay'
        })
      ])
    );
  });

  it('rejects empty timeline default easing', () => {
    const result = validateMotionTimeline({
      defaults: {
        duration: 300,
        easing: ''
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
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
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'timeline-invalid-default-easing'
        })
      ])
    );
  });

  it('accepts a valid numeric step position', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 100,
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

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('rejects a negative numeric step position', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: -1,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'timeline-invalid-step-position'
        })
      ])
    );
  });
});
