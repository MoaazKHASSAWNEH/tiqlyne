import type { MotionPlayOptions, MotionTimelineDefinition } from '@structifyx/motion-core';
import { describe, expect, it, vi } from 'vitest';
import { WebMotionDriver } from './web-motion-driver';

const defaultPlayOptions = {
  trigger: 'onClick',
  respectReducedMotion: true
} satisfies MotionPlayOptions;

describe('WebMotionDriver', () => {
  it('plays a timeline by calling element.animate', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(1);
    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: 250,
        delay: 0,
        easing: 'ease',
        fill: 'both'
      }
    );
  });

  it('skips playback when reduced motion is enabled', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: true
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'skipped',
      reason: 'reduced-motion'
    });

    expect(target.animate).not.toHaveBeenCalled();
  });

  it('does not skip playback when reduced motion is disabled', async () => {
    const driver = new WebMotionDriver({
      reducedMotion: false
    });

    const target = new FakeElement();

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('returns failed when a child target cannot be found', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();

    const result = await driver.play(
      asElement(target),
      createChildTimeline('icon'),
      defaultPlayOptions
    );

    expect(result).toEqual({
      status: 'failed',
      reason: 'target-not-found'
    });
  });

  it('plays animation on a child target', async () => {
    const driver = new WebMotionDriver();
    const root = new FakeElement();
    const child = new FakeElement();

    root.setQueryResult('[data-motion-child="icon"]', asElement(child));

    const result = await driver.play(
      asElement(root),
      createChildTimeline('icon'),
      defaultPlayOptions
    );

    expect(result).toEqual({
      status: 'finished'
    });

    expect(root.animate).not.toHaveBeenCalled();
    expect(child.animate).toHaveBeenCalledTimes(1);
  });

  it('cancels animations on a target subtree', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const animation = createAnimationMock();

    target.setAnimations([animation]);

    const result = await driver.cancel(asElement(target));

    expect(result).toEqual({
      status: 'cancelled',
      reason: 'web-driver-cancel'
    });

    expect(target.getAnimations).toHaveBeenCalledWith({
      subtree: true
    });

    expect(animation.cancel).toHaveBeenCalledTimes(1);
  });

  it('finishes animations on a target subtree', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const animation = createAnimationMock();

    target.setAnimations([animation]);

    const result = await driver.finish(asElement(target));

    expect(result).toEqual({
      status: 'finished',
      reason: 'web-driver-finish'
    });

    expect(target.getAnimations).toHaveBeenCalledWith({
      subtree: true
    });

    expect(animation.finish).toHaveBeenCalledTimes(1);
  });

  it('resets a target by cancelling animations and removing inline styles', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const animation = createAnimationMock();

    target.setAnimations([animation]);

    const result = await driver.reset(asElement(target));

    expect(result).toEqual({
      status: 'finished',
      reason: 'web-driver-reset'
    });

    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(target.removeAttribute).toHaveBeenCalledWith('style');
  });

  it('cancels previous animations before playing a new animation by default', async () => {
    const driver = new WebMotionDriver();
    const target = new FakeElement();
    const previousAnimation = createAnimationMock();

    target.setAnimations([previousAnimation]);

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(previousAnimation.cancel).toHaveBeenCalledTimes(1);
    expect(target.animate).toHaveBeenCalledTimes(1);
  });

  it('does not cancel previous animations when cancelPreviousAnimations is false', async () => {
    const driver = new WebMotionDriver({
      cancelPreviousAnimations: false
    });

    const target = new FakeElement();
    const previousAnimation = createAnimationMock();

    target.setAnimations([previousAnimation]);

    const result = await driver.play(asElement(target), createSelfTimeline(), defaultPlayOptions);

    expect(result).toEqual({
      status: 'finished'
    });

    expect(previousAnimation.cancel).not.toHaveBeenCalled();
    expect(target.animate).toHaveBeenCalledTimes(1);
  });
});

class FakeElement {
  readonly animate = vi.fn(
    (
      _keyframes: Keyframe[] | PropertyIndexedKeyframes,
      _options?: number | KeyframeAnimationOptions
    ): Animation => {
      const animation = createAnimationMock();

      this.animations.push(animation);

      return animation;
    }
  );

  readonly getAnimations = vi.fn((_options?: { readonly subtree?: boolean }): Animation[] => {
    return this.animations;
  });

  readonly removeAttribute = vi.fn((_name: string): void => {});

  private readonly queryResults = new Map<string, Element | null>();
  private animations: Animation[] = [];

  setQueryResult(selector: string, element: Element | null): void {
    this.queryResults.set(selector, element);
  }

  setAnimations(animations: ReadonlyArray<Animation>): void {
    this.animations = [...animations];
  }

  querySelector(selector: string): Element | null {
    return this.queryResults.get(selector) ?? null;
  }
}

function createAnimationMock(): Animation {
  const animation = {
    finished: Promise.resolve(),
    cancel: vi.fn((): void => {}),
    finish: vi.fn((): void => {})
  };

  return animation as unknown as Animation;
}

function asElement(element: FakeElement): Element {
  return element as unknown as Element;
}

function createSelfTimeline(): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: 250,
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

function createChildTimeline(name: string): MotionTimelineDefinition {
  return {
    tracks: [
      {
        target: {
          type: 'child',
          name
        },
        steps: [
          {
            duration: 250,
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
