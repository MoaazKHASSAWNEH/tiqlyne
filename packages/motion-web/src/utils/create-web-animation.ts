import type {
  MotionStaggerDefinition,
  MotionStepDefinition,
  ScheduledMotionTask
} from '@structifyx/motion-core';
import { resolveStaggerOffset } from './resolve-stagger-offset';
import { toWebKeyframes } from './to-web-keyframes';
import { toWebScheduledTaskTimingOptions, toWebStepTimingOptions } from './to-web-timing-options';

export function createWebAnimationFromStep(
  target: Element,
  step: MotionStepDefinition,
  staggerOffset = 0
): Animation {
  const timing = toWebStepTimingOptions(step);

  return target.animate(toWebKeyframes(step.keyframes), {
    ...timing,
    delay: Number(timing.delay ?? 0) + staggerOffset
  });
}

export function createWebAnimationsFromScheduledTask(
  targets: ReadonlyArray<Element>,
  task: ScheduledMotionTask,
  stagger: MotionStaggerDefinition | undefined
): ReadonlyArray<Animation> {
  return targets.map((target, targetIndex) => {
    const timing = toWebScheduledTaskTimingOptions(task);
    const staggerOffset = resolveStaggerOffset(stagger, targetIndex, targets.length);

    return target.animate(toWebKeyframes(task.step.keyframes), {
      ...timing,
      delay: Number(timing.delay ?? 0) + staggerOffset
    });
  });
}
