import type {
  MotionEasing,
  MotionIterationCount,
  MotionStepDefinition,
  ScheduledMotionTask
} from '@tiqlyne/motion-core';

export function toWebStepTimingOptions(step: MotionStepDefinition): KeyframeAnimationOptions {
  const iterations = toWebIterations(step.iterations);
  const direction = toWebDirection(step);

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
    ...(direction !== undefined
      ? {
          direction
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
  const direction = toWebDirection(task.step);

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
    ...(direction !== undefined
      ? {
          direction
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

type WebDirectionSource = {
  readonly yoyo?: boolean | undefined;
  readonly direction?: PlaybackDirection | undefined;
};

function toWebDirection(source: WebDirectionSource): PlaybackDirection | undefined {
  if (source.yoyo === true) {
    return 'alternate';
  }

  return source.direction;
}
