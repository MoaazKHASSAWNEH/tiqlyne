import type { MotionTimelineDefinition } from '@tiqlyne/motion-core';
import { describe, expect, it, vi } from 'vitest';
import { resolveWebTarget, resolveWebTargets, resolveWebTrackTargets } from './resolve-web-targets';

class FakeElement {
  readonly animate = vi.fn();

  private readonly queryResults = new Map<string, Element>();
  private readonly queryAllResults = new Map<string, ReadonlyArray<Element>>();

  querySelector(selector: string): Element | null {
    return this.queryResults.get(selector) ?? null;
  }

  querySelectorAll(selector: string): NodeListOf<Element> {
    return (this.queryAllResults.get(selector) ?? []) as unknown as NodeListOf<Element>;
  }

  setQueryResult(selector: string, element: Element): void {
    this.queryResults.set(selector, element);
  }

  setQueryAllResult(selector: string, elements: ReadonlyArray<Element>): void {
    this.queryAllResults.set(selector, elements);
  }
}

describe('resolveWebTarget', () => {
  it('resolves self target', () => {
    const root = new FakeElement();

    expect(resolveWebTarget(asElement(root), { type: 'self' })).toBe(asElement(root));
  });

  it('resolves child target', () => {
    const root = new FakeElement();
    const child = new FakeElement();

    root.setQueryResult('[data-motion-child="title"]', asElement(child));

    expect(resolveWebTarget(asElement(root), { type: 'child', name: 'title' })).toBe(
      asElement(child)
    );
  });

  it('resolves selector target with querySelector', () => {
    const root = new FakeElement();
    const item = new FakeElement();

    root.setQueryResult('.item', asElement(item));

    expect(resolveWebTarget(asElement(root), { type: 'selector', selector: '.item' })).toBe(
      asElement(item)
    );
  });
});

describe('resolveWebTargets', () => {
  it('resolves self as a single target', () => {
    const root = new FakeElement();

    expect(resolveWebTargets(asElement(root), { type: 'self' })).toEqual([asElement(root)]);
  });

  it('resolves selector target with querySelectorAll', () => {
    const root = new FakeElement();
    const first = new FakeElement();
    const second = new FakeElement();

    root.setQueryAllResult('.item', [asElement(first), asElement(second)]);

    expect(resolveWebTargets(asElement(root), { type: 'selector', selector: '.item' })).toEqual([
      asElement(first),
      asElement(second)
    ]);
  });

  it('returns an empty array when selector target matches nothing', () => {
    const root = new FakeElement();

    expect(resolveWebTargets(asElement(root), { type: 'selector', selector: '.missing' })).toEqual(
      []
    );
  });
});

describe('resolveWebTrackTargets', () => {
  it('resolves all targets for a timeline', () => {
    const root = new FakeElement();
    const first = new FakeElement();
    const second = new FakeElement();

    root.setQueryAllResult('.item', [asElement(first), asElement(second)]);

    const timeline: MotionTimelineDefinition = {
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
                  opacity: 1
                }
              ]
            }
          ]
        },
        {
          target: {
            type: 'selector',
            selector: '.item'
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
    };

    expect(resolveWebTrackTargets(asElement(root), timeline)).toEqual([
      asElement(root),
      asElement(first),
      asElement(second)
    ]);
  });

  it('returns null when one timeline track has no target', () => {
    const root = new FakeElement();

    const timeline: MotionTimelineDefinition = {
      tracks: [
        {
          target: {
            type: 'selector',
            selector: '.missing'
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
    };

    expect(resolveWebTrackTargets(asElement(root), timeline)).toBeNull();
  });
});

function asElement(element: FakeElement): Element {
  return element as unknown as Element;
}
