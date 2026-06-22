import type { MotionStaggerDefinition } from '@structifyx/motion-core';

export function resolveStaggerOffset(
  stagger: MotionStaggerDefinition | undefined,
  targetIndex: number,
  targetCount: number
): number {
  if (stagger === undefined) {
    return 0;
  }

  if (typeof stagger === 'number') {
    return targetIndex * stagger;
  }

  const from = stagger.from ?? 'start';

  switch (from) {
    case 'start':
      return targetIndex * stagger.each;

    case 'end':
      return (targetCount - 1 - targetIndex) * stagger.each;

    case 'center': {
      const center = (targetCount - 1) / 2;
      const distanceFromCenter = Math.abs(targetIndex - center);
      const minimumDistance = targetCount % 2 === 0 ? 0.5 : 0;

      return (distanceFromCenter - minimumDistance) * stagger.each;
    }

    default:
      return 0;
  }
}
