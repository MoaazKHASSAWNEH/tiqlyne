import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import { MotionPlanningError } from '../engine/motion-planning-error';
import type { MotionKeyframe } from '../models/motion-keyframe';
import type { PreparedMotionStep } from '../models/prepared-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { clamp } from '../utils/clamp';
import type {
  MotionTimelineSample,
  MotionTimelineSampleInput,
  MotionTimelineStepSample,
  MotionTimelineTrackSample
} from './motion-timeline-sample';

export function sampleMotionTimeline(
  timeline: MotionTimelineDefinition,
  input: MotionTimelineSampleInput
): MotionTimelineSample {
  const preparedTimeline = prepareMotionTimeline(timeline);
  const duration = preparedTimeline.totalDuration;
  const time = resolveSampleTime(input, duration);
  const progress = resolveSampleProgress(time, duration);

  const tracks = preparedTimeline.tracks.map((track): MotionTimelineTrackSample => {
    const steps = track.steps.map((step) => samplePreparedStep(step, time));

    return {
      trackIndex: track.trackIndex,
      target: track.target,
      steps
    };
  });

  const allSteps = tracks.flatMap((track) => track.steps);

  return {
    time,
    progress,
    duration,
    tracks,
    activeSteps: allSteps.filter((step) => step.status === 'active'),
    completedSteps: allSteps.filter((step) => step.status === 'completed'),
    pendingSteps: allSteps.filter((step) => step.status === 'pending')
  };
}

export function sampleMotionTimelineAtTime(
  timeline: MotionTimelineDefinition,
  time: number
): MotionTimelineSample {
  return sampleMotionTimeline(timeline, {
    time
  });
}

export function sampleMotionTimelineAtProgress(
  timeline: MotionTimelineDefinition,
  progress: number
): MotionTimelineSample {
  return sampleMotionTimeline(timeline, {
    progress
  });
}

function resolveSampleTime(input: MotionTimelineSampleInput, duration: number): number {
  if ('time' in input && input.time !== undefined) {
    if (!Number.isFinite(input.time)) {
      throw new MotionPlanningError(
        'Timeline sample time must be a finite number.',
        'timeline-sample-invalid-time'
      );
    }

    return duration === Infinity ? Math.max(0, input.time) : clamp(input.time, 0, duration);
  }

  if (duration === Infinity) {
    throw new MotionPlanningError(
      'Timeline progress sampling is not supported for infinite timelines.',
      'timeline-sample-infinite-progress-unsupported'
    );
  }

  if (!Number.isFinite(input.progress)) {
    throw new MotionPlanningError(
      'Timeline sample progress must be a finite number.',
      'timeline-sample-invalid-progress'
    );
  }

  return clamp(input.progress, 0, 1) * duration;
}

function resolveSampleProgress(time: number, duration: number): number {
  if (duration === Infinity) {
    return 0;
  }

  if (duration === 0) {
    return 1;
  }

  return clamp(time / duration, 0, 1);
}

function samplePreparedStep(step: PreparedMotionStep, time: number): MotionTimelineStepSample {
  const status = resolveStepStatus(step, time);
  const localTime = clamp(time - step.startTime, 0, step.activeDuration);
  const progress = resolveStepProgress(step, localTime);

  return {
    trackIndex: step.trackIndex,
    stepIndex: step.stepIndex,
    status,
    startTime: step.startTime,
    endTime: step.endTime,
    localTime,
    progress,
    keyframe: sampleKeyframes(step.keyframes, progress)
  };
}

function resolveStepStatus(
  step: PreparedMotionStep,
  time: number
): MotionTimelineStepSample['status'] {
  if (time < step.startTime) {
    return 'pending';
  }

  if (step.endTime === Infinity) {
    return 'active';
  }

  if (time >= step.endTime) {
    return 'completed';
  }

  return 'active';
}

function resolveStepProgress(step: PreparedMotionStep, localTime: number): number {
  if (step.duration === 0) {
    return 1;
  }

  const iterations = step.iterations ?? 1;
  const isInfinite = iterations === 'infinite';
  const playableDuration = isInfinite ? Infinity : step.duration * iterations;

  const activeTime = isInfinite ? localTime : clamp(localTime, 0, playableDuration);

  if (!isInfinite && activeTime >= playableDuration) {
    return resolveDirectedProgress(step, 1, Math.max(0, iterations - 1));
  }

  const iterationIndex = Math.floor(activeTime / step.duration);
  const iterationTime = activeTime % step.duration;
  const baseProgress = clamp(iterationTime / step.duration, 0, 1);

  return resolveDirectedProgress(step, baseProgress, iterationIndex);
}

function resolveDirectedProgress(
  step: PreparedMotionStep,
  progress: number,
  iterationIndex: number
): number {
  const direction = step.yoyo === true ? 'alternate' : (step.direction ?? 'normal');
  const isOddIteration = iterationIndex % 2 === 1;

  switch (direction) {
    case 'normal':
      return progress;

    case 'reverse':
      return 1 - progress;

    case 'alternate':
      return isOddIteration ? 1 - progress : progress;

    case 'alternate-reverse':
      return isOddIteration ? progress : 1 - progress;

    default:
      return progress;
  }
}

function sampleKeyframes(
  keyframes: ReadonlyArray<MotionKeyframe>,
  progress: number
): MotionKeyframe {
  if (keyframes.length === 0) {
    return {};
  }

  if (keyframes.length === 1) {
    return keyframes[0] ?? {};
  }

  const normalizedKeyframes = keyframes.map((keyframe, index) => ({
    keyframe,
    offset: keyframe.offset ?? index / (keyframes.length - 1)
  }));

  const sortedKeyframes = [...normalizedKeyframes].sort((a, b) => a.offset - b.offset);

  const first = sortedKeyframes[0];

  if (first === undefined) {
    return {};
  }

  if (progress <= first.offset) {
    return first.keyframe;
  }

  const last = sortedKeyframes.at(-1);

  if (last === undefined) {
    return {};
  }

  if (progress >= last.offset) {
    return last.keyframe;
  }

  for (let index = 0; index < sortedKeyframes.length - 1; index += 1) {
    const from = sortedKeyframes[index];
    const to = sortedKeyframes[index + 1];

    if (from === undefined || to === undefined) {
      continue;
    }

    if (progress >= from.offset && progress <= to.offset) {
      const segmentDuration = to.offset - from.offset;
      const segmentProgress =
        segmentDuration === 0 ? 1 : clamp((progress - from.offset) / segmentDuration, 0, 1);

      return interpolateKeyframes(from.keyframe, to.keyframe, segmentProgress);
    }
  }

  return last.keyframe;
}

function createOptionalNumberProperty<TKey extends string>(
  key: TKey,
  value: number | undefined
): Partial<Record<TKey, number>> {
  return value !== undefined
    ? ({
        [key]: value
      } as Partial<Record<TKey, number>>)
    : {};
}

function interpolateKeyframes(
  from: MotionKeyframe,
  to: MotionKeyframe,
  progress: number
): MotionKeyframe {
  const opacity = interpolateNumberOrDiscrete(from.opacity, to.opacity, progress);

  return {
    ...createOptionalNumberProperty('opacity', opacity),
    ...(to.transform !== undefined || from.transform !== undefined
      ? {
          transform: progress >= 1 ? to.transform : from.transform
        }
      : {}),
    ...(to.filter !== undefined || from.filter !== undefined
      ? {
          filter: progress >= 1 ? to.filter : from.filter
        }
      : {}),
    ...(to.backgroundColor !== undefined || from.backgroundColor !== undefined
      ? {
          backgroundColor: progress >= 1 ? to.backgroundColor : from.backgroundColor
        }
      : {}),
    ...(to.color !== undefined || from.color !== undefined
      ? {
          color: progress >= 1 ? to.color : from.color
        }
      : {}),
    ...(to.borderColor !== undefined || from.borderColor !== undefined
      ? {
          borderColor: progress >= 1 ? to.borderColor : from.borderColor
        }
      : {}),
    ...(to.boxShadow !== undefined || from.boxShadow !== undefined
      ? {
          boxShadow: progress >= 1 ? to.boxShadow : from.boxShadow
        }
      : {}),
    ...(to.outlineColor !== undefined || from.outlineColor !== undefined
      ? {
          outlineColor: progress >= 1 ? to.outlineColor : from.outlineColor
        }
      : {}),
    ...(from.custom !== undefined || to.custom !== undefined
      ? {
          custom: interpolateCustomProperties(from.custom, to.custom, progress)
        }
      : {})
  };
}

function interpolateNumberOrDiscrete(
  from: number | undefined,
  to: number | undefined,
  progress: number
): number | undefined {
  if (from === undefined) {
    return to;
  }

  if (to === undefined) {
    return from;
  }

  return from + (to - from) * progress;
}

function interpolateCustomProperties(
  from: MotionKeyframe['custom'],
  to: MotionKeyframe['custom'],
  progress: number
): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  const keys = new Set([...Object.keys(from ?? {}), ...Object.keys(to ?? {})]);

  for (const key of keys) {
    const fromValue = from?.[key];
    const toValue = to?.[key];

    if (typeof fromValue === 'number' && typeof toValue === 'number') {
      result[key] = fromValue + (toValue - fromValue) * progress;
      continue;
    }

    result[key] = progress >= 1 ? (toValue ?? fromValue ?? '') : (fromValue ?? toValue ?? '');
  }

  return result;
}
