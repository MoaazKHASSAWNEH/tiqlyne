import type { MotionStepDefinition, ScheduledMotionTask } from '@structifyx/motion-core';
import { describe, expect, it, vi } from 'vitest';
import {
  createWebAnimationFromStep,
  createWebAnimationsFromScheduledTask
} from './create-web-animation';

class FakeElement {
  readonly animation = {
    finished: Promise.resolve()
  } as unknown as Animation;

  readonly animate = vi.fn(() => this.animation);
}

describe('createWebAnimationFromStep', () => {
  it('creates a Web Animation from a motion step', () => {
    const target = new FakeElement();

    const step: MotionStepDefinition = {
      duration: 120,
      delay: 30,
      easing: 'ease-out',
      fill: 'both',
      keyframes: [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ]
    };

    const animation = createWebAnimationFromStep(asElement(target), step);

    expect(animation).toBe(target.animation);
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
        duration: 120,
        delay: 30,
        easing: 'ease-out',
        fill: 'both'
      }
    );
  });

  it('adds stagger offset to step delay', () => {
    const target = new FakeElement();

    const step: MotionStepDefinition = {
      duration: 120,
      delay: 30,
      keyframes: [
        {
          opacity: 1
        }
      ]
    };

    createWebAnimationFromStep(asElement(target), step, 80);

    expect(target.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 1
        }
      ],
      {
        duration: 120,
        delay: 110,
        easing: 'ease',
        fill: 'both'
      }
    );
  });
});

describe('createWebAnimationsFromScheduledTask', () => {
  it('creates Web Animations from a scheduled task', () => {
    const first = new FakeElement();
    const second = new FakeElement();

    const task = createScheduledTask({
      duration: 100,
      startTime: 20
    });

    const animations = createWebAnimationsFromScheduledTask(
      [asElement(first), asElement(second)],
      task,
      80
    );

    expect(animations).toEqual([first.animation, second.animation]);

    expect(first.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 20,
        easing: 'ease',
        fill: 'both'
      }
    );

    expect(second.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 100,
        easing: 'ease',
        fill: 'both'
      }
    );
  });

  it('supports advanced stagger options', () => {
    const first = new FakeElement();
    const second = new FakeElement();
    const third = new FakeElement();

    const task = createScheduledTask({
      duration: 100,
      startTime: 20
    });

    createWebAnimationsFromScheduledTask(
      [asElement(first), asElement(second), asElement(third)],
      task,
      {
        each: 80,
        from: 'end'
      }
    );

    expect(first.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 180,
        easing: 'ease',
        fill: 'both'
      }
    );

    expect(second.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 100,
        easing: 'ease',
        fill: 'both'
      }
    );

    expect(third.animate).toHaveBeenCalledWith(
      [
        {
          opacity: 1
        }
      ],
      {
        duration: 100,
        delay: 20,
        easing: 'ease',
        fill: 'both'
      }
    );
  });
});

function createScheduledTask(input: {
  readonly duration: number;
  readonly startTime: number;
}): ScheduledMotionTask {
  return {
    taskIndex: 0,
    trackIndex: 0,
    stepIndex: 0,
    startTime: input.startTime,
    endTime: input.startTime + input.duration,
    duration: input.duration,
    delay: 0,
    step: {
      trackIndex: 0,
      stepIndex: 0,
      startTime: input.startTime,
      endTime: input.startTime + input.duration,
      duration: input.duration,
      activeDuration: input.duration,
      delay: 0,
      keyframes: [
        {
          opacity: 1
        }
      ],
      source: {
        duration: input.duration,
        keyframes: [
          {
            opacity: 1
          }
        ]
      }
    }
  };
}

function asElement(element: FakeElement): Element {
  return element as unknown as Element;
}
