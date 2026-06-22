import type {
  MotionDiagnostic,
  MotionExecutionPlan,
  MotionKeyframe,
  MotionPlayOptions,
  MotionTimelineDefinition,
  ScheduledMotionTimeline
} from '@structifyx/motion-core';

export function createGenericReducedMotionFallbackDiagnostic(source: string): MotionDiagnostic {
  return {
    level: 'warning',
    code: 'reduced-motion-fallback-used',
    message:
      'Generic reduced motion fallback was used because no motion-specific reduced timeline was provided.',
    source,
    metadata: {
      strategy: 'simplify'
    }
  };
}

export function simplifyWebTimeline(timeline: MotionTimelineDefinition): MotionTimelineDefinition {
  return {
    tracks: timeline.tracks.map((track) => ({
      target: track.target,
      steps: track.steps.map((step) => ({
        keyframes: step.keyframes.map((keyframe) => simplifyWebKeyframe(keyframe)),
        duration: Math.min(step.duration, 150),
        delay: 0,
        easing: 'ease-out',
        fill: step.fill ?? 'both'
      }))
    }))
  };
}

export function resolveWebPlayableTimeline(
  timeline: MotionTimelineDefinition,
  options: MotionPlayOptions,
  shouldApplyReducedMotion: boolean
): MotionTimelineDefinition {
  if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
    return (
      options.executionPlan?.reducedMotionTimeline ??
      options.reducedMotionTimeline ??
      simplifyWebTimeline(timeline)
    );
  }

  return options.executionPlan?.timeline ?? timeline;
}

export function resolveWebActiveExecutionPlan(
  options: MotionPlayOptions,
  shouldApplyReducedMotion: boolean
): MotionExecutionPlan | undefined {
  if (!options.executionPlan) {
    return undefined;
  }

  if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
    return options.executionPlan.scheduledReducedMotionTimeline !== undefined
      ? options.executionPlan
      : undefined;
  }

  return options.executionPlan;
}

export function resolveWebScheduledTimeline(
  executionPlan: MotionExecutionPlan | undefined,
  shouldApplyReducedMotion: boolean,
  options: MotionPlayOptions
): ScheduledMotionTimeline | undefined {
  if (!executionPlan) {
    return undefined;
  }

  if (shouldApplyReducedMotion && options.reducedMotionStrategy === 'simplify') {
    return executionPlan.scheduledReducedMotionTimeline;
  }

  return executionPlan.scheduledTimeline;
}

export function resolveWebReducedMotionDiagnostics(
  options: MotionPlayOptions,
  shouldApplyReducedMotion: boolean,
  source: string
): ReadonlyArray<MotionDiagnostic> {
  const hasProvidedReducedMotionTimeline =
    options.executionPlan?.reducedMotionTimeline !== undefined ||
    options.reducedMotionTimeline !== undefined;

  if (
    shouldApplyReducedMotion &&
    options.reducedMotionStrategy === 'simplify' &&
    !hasProvidedReducedMotionTimeline
  ) {
    return [createGenericReducedMotionFallbackDiagnostic(source)];
  }

  return [];
}

function simplifyWebKeyframe(keyframe: MotionKeyframe): MotionKeyframe {
  return {
    ...(keyframe.opacity !== undefined
      ? {
          opacity: keyframe.opacity
        }
      : {}),
    ...(keyframe.offset !== undefined
      ? {
          offset: keyframe.offset
        }
      : {})
  };
}
