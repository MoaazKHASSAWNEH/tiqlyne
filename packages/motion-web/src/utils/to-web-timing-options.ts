import type {
  MotionEasing,
  MotionIterationCount,
  MotionStepDefinition,
  ScheduledMotionTask
} from '@structifyx/motion-core';

export function toWebStepTimingOptions(step: MotionStepDefinition): KeyframeAnimationOptions {
  const iterations = toWebIterations(step.iterations);

  return {
    duration: step.duration ?? 0,
    delay: step.delay ?? 0,
    easing: toWebEasing(step.easing),
    fill: step.fill ?? 'both',
    ...(iterations !== undefined
      ? {
          iterations
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
      : {}),
    ...(step.playbackRate !== undefined
      ? {
          playbackRate: step.playbackRate
        }
      : {})
  };
}

export function toWebScheduledTaskTimingOptions(
  task: ScheduledMotionTask
): KeyframeAnimationOptions {
  const iterations = toWebIterations(task.step.iterations);

  return {
    duration: task.duration,
    delay: task.startTime,
    easing: toWebEasing(task.step.easing),
    fill: task.step.fill ?? 'both',
    ...(iterations !== undefined
      ? {
          iterations
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
      : {}),
    ...(task.step.playbackRate !== undefined
      ? {
          playbackRate: task.step.playbackRate
        }
      : {})
  };
}

function toWebIterations(iterations: MotionIterationCount | undefined): number | undefined {
  if (iterations === 'infinite') {
    return Infinity;
  }

  return iterations;
}

function toWebEasing(easing: MotionEasing | undefined): string {
  if (easing === undefined) {
    return 'ease';
  }

  if (typeof easing === 'string') {
    return easing;
  }

  if (easing.type === 'cubicBezier') {
    return `cubic-bezier(${easing.x1}, ${easing.y1}, ${easing.x2}, ${easing.y2})`;
  }

  return `steps(${easing.count}, ${easing.position ?? 'end'})`;
}
