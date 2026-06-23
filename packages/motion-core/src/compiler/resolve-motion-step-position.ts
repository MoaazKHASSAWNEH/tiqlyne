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

  if (typeof position === 'string') {
    return labels?.[position] ?? cursor;
  }

  return (labels?.[position.label] ?? cursor) + (position.offset ?? 0);
}
