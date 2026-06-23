import type { MotionStepPosition, MotionTimelineLabels } from '../models/motion-timeline';

export function resolveMotionStepPosition(
  position: MotionStepPosition | undefined,
  labels: MotionTimelineLabels | undefined,
  cursor: number
): number {
  if (position === undefined) {
    return cursor;
  }

  if (typeof position === 'number') {
    return position;
  }

  return labels?.[position] ?? cursor;
}
