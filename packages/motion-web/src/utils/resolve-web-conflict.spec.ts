import type { MotionPlayOptions } from '@structifyx/motion-core';
import { describe, expect, it, vi } from 'vitest';
import {
  cancelWebAnimations,
  getEffectiveWebConflictStrategy,
  hasActiveWebAnimations,
  isActiveWebAnimation
} from './resolve-web-conflict';

const defaultPlayOptions: MotionPlayOptions = {
  trigger: 'manual',
  respectReducedMotion: true,
  reducedMotionStrategy: 'preserve',
  conflictStrategy: 'replace'
};

class FakeElement {
  private readonly animations: Animation[] = [];

  getAnimations(): Animation[] {
    return this.animations;
  }

  setAnimations(animations: Animation[]): void {
    this.animations.length = 0;
    this.animations.push(...animations);
  }
}

describe('getEffectiveWebConflictStrategy', () => {
  it('keeps configured conflict strategy by default', () => {
    expect(getEffectiveWebConflictStrategy(defaultPlayOptions)).toBe('replace');
  });

  it('converts replace to parallel when cancelPreviousAnimations is false', () => {
    expect(
      getEffectiveWebConflictStrategy(defaultPlayOptions, {
        cancelPreviousAnimations: false
      })
    ).toBe('parallel');
  });

  it('keeps ignore even when cancelPreviousAnimations is false', () => {
    expect(
      getEffectiveWebConflictStrategy(
        {
          ...defaultPlayOptions,
          conflictStrategy: 'ignore'
        },
        {
          cancelPreviousAnimations: false
        }
      )
    ).toBe('ignore');
  });
});

describe('isActiveWebAnimation', () => {
  it('returns true for running animations', () => {
    expect(
      isActiveWebAnimation(
        createAnimation({
          playState: 'running'
        })
      )
    ).toBe(true);
  });

  it('returns true for paused animations', () => {
    expect(
      isActiveWebAnimation(
        createAnimation({
          playState: 'paused'
        })
      )
    ).toBe(true);
  });

  it('returns true for pending animations', () => {
    expect(
      isActiveWebAnimation(
        createAnimation({
          playState: 'idle',
          pending: true
        })
      )
    ).toBe(true);
  });

  it('returns false for finished non-pending animations', () => {
    expect(
      isActiveWebAnimation(
        createAnimation({
          playState: 'finished',
          pending: false
        })
      )
    ).toBe(false);
  });
});

describe('hasActiveWebAnimations', () => {
  it('returns true when at least one target has an active animation', () => {
    const first = new FakeElement();
    const second = new FakeElement();

    second.setAnimations([
      createAnimation({
        playState: 'running'
      })
    ]);

    expect(hasActiveWebAnimations([asElement(first), asElement(second)])).toBe(true);
  });

  it('returns false when no target has active animations', () => {
    const first = new FakeElement();
    const second = new FakeElement();

    first.setAnimations([
      createAnimation({
        playState: 'finished',
        pending: false
      })
    ]);

    second.setAnimations([
      createAnimation({
        playState: 'idle',
        pending: false
      })
    ]);

    expect(hasActiveWebAnimations([asElement(first), asElement(second)])).toBe(false);
  });
});

describe('cancelWebAnimations', () => {
  it('cancels all animations on all targets', () => {
    const first = new FakeElement();
    const second = new FakeElement();

    const firstAnimation = createAnimation();
    const secondAnimation = createAnimation();

    first.setAnimations([firstAnimation]);
    second.setAnimations([secondAnimation]);

    cancelWebAnimations([asElement(first), asElement(second)]);

    expect(firstAnimation.cancel).toHaveBeenCalledOnce();
    expect(secondAnimation.cancel).toHaveBeenCalledOnce();
  });
});

function createAnimation(
  input: {
    readonly playState?: AnimationPlayState;
    readonly pending?: boolean;
  } = {}
): Animation {
  return {
    playState: input.playState ?? 'idle',
    pending: input.pending ?? false,
    cancel: vi.fn()
  } as unknown as Animation;
}

function asElement(element: FakeElement): Element {
  return element as unknown as Element;
}
