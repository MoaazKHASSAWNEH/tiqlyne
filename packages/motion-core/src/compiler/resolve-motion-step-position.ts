import type {
  MotionStepAnchor,
  MotionStepPosition,
  MotionTimelineLabels
} from '../models/motion-timeline';

export type ResolveMotionStepPositionContext = {
  readonly previousStartTime?: number;
  readonly previousEndTime?: number;
};

export function resolveMotionStepPosition(
  position: MotionStepPosition | undefined,
  labels: MotionTimelineLabels | undefined,
  cursor: number,
  context: ResolveMotionStepPositionContext = {}
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

  if ('label' in position) {
    return (labels?.[position.label] ?? cursor) + (position.offset ?? 0);
  }

  return resolveAnchorStepPosition(position.anchor, cursor, context) + (position.offset ?? 0);
}

function resolveAnchorStepPosition(
  anchor: MotionStepAnchor,
  cursor: number,
  context: ResolveMotionStepPositionContext
): number {
  switch (anchor) {
    case 'track-start':
      return 0;

    case 'track-end':
      return cursor;

    case 'previous-start':
      return context.previousStartTime ?? cursor;

    case 'previous-end':
      return context.previousEndTime ?? cursor;
  }
}
