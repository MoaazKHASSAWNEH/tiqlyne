import type {
  PreparedMotionStep,
  PreparedMotionTimeline,
  PreparedMotionTrack
} from '../models/prepared-motion-timeline';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { applyMotionTimelineDefaults } from './apply-motion-timeline-defaults';

export function prepareMotionTimeline(timeline: MotionTimelineDefinition): PreparedMotionTimeline {
  const resolvedTimeline = applyMotionTimelineDefaults(timeline);

  const tracks = resolvedTimeline.tracks.map((track, trackIndex): PreparedMotionTrack => {
    let cursor = 0;

    const steps = track.steps.map((step, stepIndex): PreparedMotionStep => {
      const delay = step.delay ?? 0;
      const duration = step.duration ?? 0;
      const startTime = (step.at ?? cursor) + delay;
      const endTime = startTime + duration;

      cursor = Math.max(cursor, endTime);

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
