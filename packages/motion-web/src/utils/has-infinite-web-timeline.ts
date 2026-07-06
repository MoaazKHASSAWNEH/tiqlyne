import type { MotionTimelineDefinition } from '@tiqlyne/motion-core';

export function hasInfiniteWebTimeline(timeline: MotionTimelineDefinition): boolean {
  return timeline.tracks.some((track) =>
    track.steps.some((step) => {
      const iterations =
        step.iterations ?? track.defaults?.iterations ?? timeline.defaults?.iterations ?? 1;

      return iterations === 'infinite';
    })
  );
}
