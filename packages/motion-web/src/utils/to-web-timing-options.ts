import type { MotionStepDefinition, ScheduledMotionTask } from '@structifyx/motion-core';

export function toWebStepTimingOptions(step: MotionStepDefinition): KeyframeAnimationOptions {
  return {
    duration: step.duration ?? 0,
    delay: step.delay ?? 0,
    easing: step.easing ?? 'ease',
    fill: step.fill ?? 'both'
  };
}

export function toWebScheduledTaskTimingOptions(
  task: ScheduledMotionTask
): KeyframeAnimationOptions {
  return {
    duration: task.duration,
    delay: task.startTime,
    easing: task.step.easing ?? 'ease',
    fill: task.step.fill ?? 'both'
  };
}
