import type {
  PreparedMotionStep,
  PreparedMotionTimeline,
  PreparedMotionTrack
} from '../models/prepared-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { applyMotionTimelineDefaults } from './apply-motion-timeline-defaults';
import { resolveMotionStepPosition } from './resolve-motion-step-position';

export function prepareMotionTimeline(timeline: MotionTimelineDefinition): PreparedMotionTimeline {
  const resolvedTimeline = applyMotionTimelineDefaults(timeline);

  const tracks = resolvedTimeline.tracks.map((track, trackIndex): PreparedMotionTrack => {
    let cursor = 0;
    let previousStartTime: number | undefined;
    let previousEndTime: number | undefined;

    const steps = track.steps.map((step, stepIndex): PreparedMotionStep => {
      const delay = step.delay ?? 0;
      const duration = step.duration ?? 0;
      const endDelay = step.endDelay ?? 0;
      const iterations = step.iterations ?? 1;
      const activeDuration =
        iterations === 'infinite' ? Infinity : duration * iterations + endDelay;

      const startTime =
        resolveMotionStepPosition(step.at, resolvedTimeline.labels, cursor, {
          ...(previousStartTime !== undefined
            ? {
                previousStartTime
              }
            : {}),
          ...(previousEndTime !== undefined
            ? {
                previousEndTime
              }
            : {})
        }) + delay;

      const endTime = startTime + activeDuration;

      cursor = Math.max(cursor, endTime);
      previousStartTime = startTime;
      previousEndTime = endTime;

      return {
        trackIndex,
        stepIndex,
        startTime,
        endTime,
        duration,
        delay,
        keyframes: step.keyframes,
        ...(step.easing !== undefined
          ? {
              easing: step.easing
            }
          : {}),
        ...(step.offset !== undefined
          ? {
              offset: step.offset
            }
          : {}),
        ...(step.fill !== undefined
          ? {
              fill: step.fill
            }
          : {}),
        activeDuration,
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
          : {}),
        ...(step.playbackRate !== undefined
          ? {
              playbackRate: step.playbackRate
            }
          : {}),
        source: step
      };
    });

    return {
      trackIndex,
      target: track.target,
      steps,
      duration: cursor,
      ...(track.stagger !== undefined
        ? {
            stagger: track.stagger
          }
        : {})
    };
  });

  return {
    source: resolvedTimeline,
    tracks,
    totalDuration: Math.max(0, ...tracks.map((track) => track.duration))
  };
}
