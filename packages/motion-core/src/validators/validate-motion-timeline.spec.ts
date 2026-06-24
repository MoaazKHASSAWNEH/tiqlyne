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
});
