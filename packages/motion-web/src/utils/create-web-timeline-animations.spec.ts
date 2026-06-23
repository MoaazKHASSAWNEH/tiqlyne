import type { MotionTimelineDefinition, ScheduledMotionTimeline } from '@structifyx/motion-core';
import { describe, expect, it } from 'vitest';
import {
  createWebAnimationsFromScheduledTimeline,
  createWebAnimationsFromTimeline
} from './create-web-timeline-animations';

class FakeElement {
  readonly animations: Array<{
    readonly keyframes: Keyframe[];
    readonly options: KeyframeAnimationOptions;
  }> = [];

  private readonly children: Array<{
    readonly name: string;
    readonly element: FakeElement;
  }> = [];

  querySelector(selector: string): Element | null {
    const childName = selector.match(/\[data-motion-child="(.+)"\]/)?.[1];

    if (!childName) {
      return null;
    }

    return this.children.find((child) => child.name === childName)
      ?.element as unknown as Element | null;
  }

  querySelectorAll(selector: string): Element[] {
    const selectorName = selector.startsWith('.') ? selector.slice(1) : selector;

    return this.children
      .filter((child) => child.name === selectorName)
      .map((child) => child.element as unknown as Element);
  }

  addChild(name: string, child: FakeElement): void {
    this.children.push({
      name,
      element: child
    });
  }

  animate(keyframes: Keyframe[], options?: number | KeyframeAnimationOptions): Animation {
    const normalizedOptions = typeof options === 'number' ? { duration: options } : (options ?? {});

    this.animations.push({
      keyframes,
      options: normalizedOptions
    });

    return {
      finished: Promise.resolve()
    } as unknown as Animation;
  }
}

describe('createWebAnimationsFromTimeline', () => {
  it('creates animations from timeline tracks', () => {
    const root = new FakeElement();

    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'self'
          },
          steps: [
            {
              duration: 200,
              delay: 50,
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

    const result = createWebAnimationsFromTimeline(asElement(root), timeline);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.animations).toHaveLength(1);
    }

    expect(root.animations).toHaveLength(1);
    expect(root.animations[0]?.options).toMatchObject({
      duration: 200,
      delay: 50
    });
  });

  it('returns target-not-found when a track target cannot be resolved', () => {
    const root = new FakeElement();

    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'child',
            name: 'missing'
          },
          steps: [
            {
              duration: 200,
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

    const result = createWebAnimationsFromTimeline(asElement(root), timeline);

    expect(result).toEqual({
      ok: false,
      animations: [],
      reason: 'target-not-found'
    });
  });

  it('applies stagger offsets to selector targets', () => {
    const root = new FakeElement();
    const first = new FakeElement();
    const second = new FakeElement();

    root.addChild('item', first);
    root.addChild('item', second);

    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'selector',
            selector: '.item'
          },
          stagger: 100,
          steps: [
            {
              duration: 200,
              delay: 20,
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

    const result = createWebAnimationsFromTimeline(asElement(root), timeline);

    expect(result.ok).toBe(true);
    expect(first.animations[0]?.options.delay).toBe(20);
    expect(second.animations[0]?.options.delay).toBe(120);
  });
});

describe('createWebAnimationsFromScheduledTimeline', () => {
  it('creates animations from scheduled tasks', () => {
    const root = new FakeElement();

    const scheduledTimeline: ScheduledMotionTimeline = {
      source: {
        source: {
          tracks: []
        },
        totalDuration: 200,
        tracks: [
          {
            trackIndex: 0,
            target: {
              type: 'self'
            },
            duration: 200,
            steps: []
          }
        ]
      },
      tasks: [
        {
          taskIndex: 0,
          trackIndex: 0,
          stepIndex: 0,
          startTime: 50,
          endTime: 250,
          duration: 200,
          delay: 50,
          step: {
            trackIndex: 0,
            stepIndex: 0,
            startTime: 50,
            endTime: 250,
            duration: 200,
            activeDuration: 200,
            delay: 50,
            keyframes: [
              {
                opacity: 1
              }
            ],
            source: {
              duration: 200,
              delay: 50,
              keyframes: [
                {
                  opacity: 1
                }
              ]
            }
          }
        }
      ],
      totalDuration: 250
    };

    const result = createWebAnimationsFromScheduledTimeline(asElement(root), scheduledTimeline);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.animations).toHaveLength(1);
    }

    expect(root.animations[0]?.options).toMatchObject({
      duration: 200,
      delay: 50
    });
  });
});

function asElement(element: FakeElement): Element {
  return element as unknown as Element;
}
