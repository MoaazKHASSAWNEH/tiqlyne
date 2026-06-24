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

  it('rejects non-object target references', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: null as never,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-target',
        message: 'Timeline target must be an object.',
        metadata: expect.objectContaining({
          trackIndex: 0
        })
      })
    );
  });

  it('rejects unknown target types', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'unknown'
          } as never,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-target-type',
        message: 'Timeline target type is invalid.',
        metadata: expect.objectContaining({
          trackIndex: 0,
          targetType: 'unknown'
        })
      })
    );
  });

  it('rejects missing selector target value', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'selector'
          } as never,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-target-selector',
        message: 'Timeline target selector must be a non-empty string.',
        metadata: expect.objectContaining({
          trackIndex: 0
        })
      })
    );
  });

  it('rejects missing named target value', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'named'
          } as never,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-target-name',
        message: 'Timeline target name must be a non-empty string.',
        metadata: expect.objectContaining({
          trackIndex: 0,
          targetType: 'named'
        })
      })
    );
  });

  it('rejects non-string target names', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'child',
            name: 123
          } as never,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-target-name',
        message: 'Timeline target name must be a non-empty string.',
        metadata: expect.objectContaining({
          trackIndex: 0,
          targetType: 'child'
        })
      })
    );
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
        easing: '' as never
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

  it('rejects invalid easing keywords', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              easing: 'spring' as never,
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-easing',
          message: 'Timeline step easing is invalid.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            easing: 'spring'
          })
        })
      ]
    });
  });

  it('rejects unknown structured easing types', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              easing: {
                type: 'spring'
              } as never,
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
        code: 'timeline-invalid-easing',
        message: 'Timeline step easing is invalid.',
        metadata: expect.objectContaining({
          trackIndex: 0,
          stepIndex: 0,
          easingType: 'spring'
        })
      })
    );
  });

  it('rejects cubic bezier x values outside the 0 to 1 range', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              easing: {
                type: 'cubicBezier',
                x1: -0.1,
                y1: 1,
                x2: 1.1,
                y2: 1
              },
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
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'timeline-invalid-easing',
      'timeline-invalid-easing'
    ]);
  });

  it('rejects non-finite cubic bezier y values', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              easing: {
                type: 'cubicBezier',
                x1: 0.16,
                y1: Number.NaN,
                x2: 0.3,
                y2: Infinity
              },
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
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'timeline-invalid-easing',
      'timeline-invalid-easing'
    ]);
  });

  it('rejects invalid steps easing count', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              easing: {
                type: 'steps',
                count: 0
              },
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-easing',
          message: 'Timeline step easing is invalid.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            easingType: 'steps',
            easingField: 'count',
            easingValue: 0
          })
        })
      ]
    });
  });

  it('rejects invalid steps easing positions', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              easing: {
                type: 'steps',
                count: 4,
                position: 'middle'
              } as never,
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-easing',
          message: 'Timeline step easing is invalid.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            easingType: 'steps',
            easingField: 'position',
            easingValue: 'middle'
          })
        })
      ]
    });
  });

  it('rejects invalid default easing values', () => {
    const result = validateMotionTimeline({
      defaults: {
        easing: {
          type: 'steps',
          count: -1
        } as never
      },
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-default-easing',
          message: 'Timeline default easing is invalid.',
          metadata: expect.objectContaining({
            defaultSource: 'timeline',
            easingType: 'steps',
            easingField: 'count',
            easingValue: -1
          })
        }),
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-easing',
          message: 'Timeline step easing is invalid.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            easingType: 'steps',
            easingField: 'count',
            easingValue: -1
          })
        })
      ]
    });
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

  it('accepts a valid label step position', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 'intro',
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

  it('rejects an unknown label step position', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 'missing',
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
          code: 'timeline-unknown-step-label'
        })
      ])
    );
  });

  it('rejects an empty label step position', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: '',
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
          code: 'timeline-invalid-step-label'
        })
      ])
    );
  });

  it('rejects an invalid timeline label position', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: -1
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: 'intro',
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
          code: 'timeline-invalid-label-position'
        })
      ])
    );
  });

  it('accepts a typed label step position', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'intro'
              },
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

  it('accepts a typed label step position with offset', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'intro',
                offset: 50
              },
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

  it('rejects a typed label step position with unknown label', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'missing'
              },
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
          code: 'timeline-unknown-step-label'
        })
      ])
    );
  });

  it('rejects a typed label step position with empty label', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: ''
              },
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
          code: 'timeline-invalid-step-label'
        })
      ])
    );
  });

  it('rejects a typed label step position with non-finite offset', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 100
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'intro',
                offset: Number.NaN
              },
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
          code: 'timeline-invalid-step-position-offset'
        })
      ])
    );
  });

  it('rejects a typed label step position resolving to a negative position', () => {
    const result = validateMotionTimeline({
      labels: {
        intro: 50
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                label: 'intro',
                offset: -100
              },
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

  it('accepts a valid track-start anchor step position', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                anchor: 'track-start',
                offset: 100
              },
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

  it('accepts a valid previous-end anchor step position', () => {
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
                  opacity: 1
                }
              ]
            },
            {
              at: {
                anchor: 'previous-end',
                offset: -50
              },
              duration: 200,
              keyframes: [
                {
                  opacity: 0
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

  it('rejects a previous anchor on the first step', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                anchor: 'previous-start'
              },
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
          code: 'timeline-invalid-step-anchor'
        })
      ])
    );
  });

  it('rejects an anchor step position with non-finite offset', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                anchor: 'track-start',
                offset: Number.NaN
              },
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
          code: 'timeline-invalid-step-position-offset'
        })
      ])
    );
  });

  it('rejects a track-start anchor resolving to a negative position', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              at: {
                anchor: 'track-start',
                offset: -1
              },
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

  it('accepts playback timing options', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              iterations: 2,
              direction: 'alternate',
              playbackRate: 2,
              endDelay: 100,
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

  it('rejects invalid iterations', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              iterations: 0,
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
          code: 'timeline-invalid-iterations'
        })
      ])
    );
  });

  it('rejects invalid direction', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              direction: 'invalid' as never,
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
          code: 'timeline-invalid-direction'
        })
      ])
    );
  });

  it('rejects non-boolean yoyo values', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              yoyo: 'yes' as never,
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-yoyo',
          message: 'Timeline yoyo must be a boolean.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0
          })
        })
      ]
    });
  });

  it('rejects yoyo and direction used together', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              yoyo: true,
              direction: 'alternate',
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-yoyo-direction-conflict',
          message: 'Timeline yoyo cannot be used together with direction.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            direction: 'alternate'
          })
        })
      ]
    });
  });

  it('rejects invalid default yoyo values', () => {
    const result = validateMotionTimeline({
      defaults: {
        yoyo: 'yes' as never
      },
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
        code: 'timeline-invalid-yoyo',
        message: 'Timeline yoyo must be a boolean.',
        metadata: expect.objectContaining({
          defaultSource: 'timeline'
        })
      })
    );
  });

  it('rejects invalid end delay', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              endDelay: -1,
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
          code: 'timeline-invalid-end-delay'
        })
      ])
    );
  });

  it('rejects invalid playback rate', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              playbackRate: 0,
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
          code: 'timeline-invalid-playback-rate'
        })
      ])
    );
  });

  it('reports unreachable implicit steps after an infinite step', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              iterations: 'infinite',
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              duration: 200,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0
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
        code: 'timeline-unreachable-step',
        message:
          'Timeline step cannot be scheduled because its position depends on an infinite duration.',
        metadata: expect.objectContaining({
          trackIndex: 0,
          stepIndex: 1,
          reason: 'implicit-position-after-infinite-duration'
        })
      })
    );
  });

  it('reports unreachable previous-end anchors after an infinite step', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              iterations: 'infinite',
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              at: {
                anchor: 'previous-end'
              },
              duration: 200,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0
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
        code: 'timeline-unreachable-step',
        metadata: expect.objectContaining({
          trackIndex: 0,
          stepIndex: 1,
          reason: 'previous-end-after-infinite-duration'
        })
      })
    );
  });

  it('allows finite explicit positions after an infinite step', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 300,
              iterations: 'infinite',
              keyframes: [
                {
                  opacity: 0
                },
                {
                  opacity: 1
                }
              ]
            },
            {
              at: 1000,
              duration: 200,
              keyframes: [
                {
                  opacity: 1
                },
                {
                  opacity: 0
                }
              ]
            }
          ]
        }
      ]
    });

    expect(result.valid).toBe(true);
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: 'timeline-unreachable-step'
      })
    );
  });

  it('rejects invalid step fill mode', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 100,
              fill: 'invalid' as never,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-fill',
        message: 'Timeline step fill mode is invalid.',
        metadata: expect.objectContaining({
          trackIndex: 0,
          stepIndex: 0,
          fill: 'invalid'
        })
      })
    );
  });

  it('rejects invalid timeline default fill mode', () => {
    const result = validateMotionTimeline({
      defaults: {
        fill: 'invalid' as never
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 100,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-default-fill',
        message: 'Timeline default fill mode is invalid.',
        metadata: expect.objectContaining({
          defaultSource: 'timeline',
          fill: 'invalid'
        })
      })
    );
  });

  it('rejects invalid track default fill mode', () => {
    const result = validateMotionTimeline({
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            fill: 'invalid' as never
          },
          steps: [
            {
              duration: 100,
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

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        level: 'error',
        code: 'timeline-invalid-default-fill',
        message: 'Timeline default fill mode is invalid.',
        metadata: expect.objectContaining({
          defaultSource: 'track',
          trackIndex: 0,
          fill: 'invalid'
        })
      })
    );
  });

  it('accepts valid fill modes', () => {
    const result = validateMotionTimeline({
      defaults: {
        fill: 'both'
      },
      tracks: [
        {
          target: {
            type: 'self'
          },
          defaults: {
            fill: 'forwards'
          },
          steps: [
            {
              duration: 100,
              fill: 'backwards',
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

    expect(result.valid).toBe(true);
  });

  it('rejects empty transform strings', () => {
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
                  transform: '' as never
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-transform',
          message:
            'Keyframe transform must be a non-empty string or a structured transform object.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            keyframeIndex: 0
          })
        })
      ]
    });
  });

  it('rejects invalid transform values', () => {
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
                  transform: 123 as never
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
        code: 'timeline-invalid-transform'
      })
    );
  });

  it('rejects invalid structured transform scale values', () => {
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
                  transform: {
                    scale: Number.NaN
                  } as never
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-transform-value',
          message: 'Transform scale value must be a finite number.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            keyframeIndex: 0,
            transformProperty: 'scale'
          })
        })
      ]
    });
  });

  it('rejects invalid structured transform origins', () => {
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
                  transform: {
                    origin: ''
                  }
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
        expect.objectContaining({
          level: 'error',
          code: 'timeline-invalid-transform-origin',
          message: 'Transform origin must be a non-empty string.',
          metadata: expect.objectContaining({
            trackIndex: 0,
            stepIndex: 0,
            keyframeIndex: 0
          })
        })
      ]
    });
  });
});
