import type { MotionStepDefinition, ScheduledMotionTask } from '@structifyx/motion-core';

export function toWebStepTimingOptions(step: MotionStepDefinition): KeyframeAnimationOptions {
  return {
    duration: step.duration ?? 0,
    delay: step.delay ?? 0,
    easing: step.easing ?? 'ease',
    fill: step.fill ?? 'both',
    ...(step.iterations !== undefined
      ? {
          iterations: step.iterations
        }
      : {}),
    ...(step.direction !== undefined
      ? {
          direction: step.direction
        }
      : {}),
    ...(step.endDelay !== undefined
      ? {
          endDelay: step.endDelay
        }
      : {})
  };
}

export function toWebScheduledTaskTimingOptions(
  task: ScheduledMotionTask
): KeyframeAnimationOptions {
  return {
    duration: task.duration,
    delay: task.startTime,
    easing: task.step.easing ?? 'ease',
    fill: task.step.fill ?? 'both',
    ...(task.step.iterations !== undefined
      ? {
          iterations: task.step.iterations
        }
      : {}),
    ...(task.step.direction !== undefined
      ? {
          direction: task.step.direction
        }
      : {}),
    ...(task.step.endDelay !== undefined
      ? {
          endDelay: task.step.endDelay
        }
      : {})
  };
}
