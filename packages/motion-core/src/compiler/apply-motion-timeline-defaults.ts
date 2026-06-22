import type {
  MotionStepDefinition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTrackDefinition
} from '../models/motion-timeline';

export function applyMotionTimelineDefaults(
  timeline: MotionTimelineDefinition
): MotionTimelineDefinition {
  let timelineChanged = false;

  const tracks = timeline.tracks.map((track) => {
    const defaults = mergeMotionTimelineDefaults(timeline.defaults, track.defaults);

    if (!hasMotionTimelineDefaults(defaults)) {
      return track;
    }

    const resolvedTrack = applyMotionTrackDefaults(track, defaults);

    if (resolvedTrack !== track) {
      timelineChanged = true;
    }

    return resolvedTrack;
  });

  if (!timelineChanged) {
    return timeline;
  }

  return {
    ...timeline,
    tracks
  };
}

export function applyMotionStepDefaults(
  step: MotionStepDefinition,
  defaults: MotionTimelineDefaults
): MotionStepDefinition {
  let changed = false;

  const duration = step.duration ?? defaults.duration;
  const delay = step.delay ?? defaults.delay;
  const easing = step.easing ?? defaults.easing;
  const fill = step.fill ?? defaults.fill;

  if (duration !== step.duration && duration !== undefined) {
    changed = true;
  }

  if (delay !== step.delay && delay !== undefined) {
    changed = true;
  }

  if (easing !== step.easing && easing !== undefined) {
    changed = true;
  }

  if (fill !== step.fill && fill !== undefined) {
    changed = true;
  }

  if (!changed) {
    return step;
  }

  return {
    ...step,
    ...(duration !== undefined
      ? {
          duration
        }
      : {}),
    ...(delay !== undefined
      ? {
          delay
        }
      : {}),
    ...(easing !== undefined
      ? {
          easing
        }
      : {}),
    ...(fill !== undefined
      ? {
          fill
        }
      : {})
  };
}

export function mergeMotionTimelineDefaults(
  timelineDefaults: MotionTimelineDefaults | undefined,
  trackDefaults: MotionTimelineDefaults | undefined
): MotionTimelineDefaults {
  return {
    ...(timelineDefaults ?? {}),
    ...(trackDefaults ?? {})
  };
}

export function hasMotionTimelineDefaults(defaults: MotionTimelineDefaults): boolean {
  return (
    defaults.duration !== undefined ||
    defaults.delay !== undefined ||
    defaults.easing !== undefined ||
    defaults.fill !== undefined
  );
}

function applyMotionTrackDefaults(
  track: MotionTrackDefinition,
  defaults: MotionTimelineDefaults
): MotionTrackDefinition {
  let trackChanged = false;

  const steps = track.steps.map((step) => {
    const resolvedStep = applyMotionStepDefaults(step, defaults);

    if (resolvedStep !== step) {
      trackChanged = true;
    }

    return resolvedStep;
  });

  if (!trackChanged) {
    return track;
  }

  return {
    ...track,
    steps
  };
}
