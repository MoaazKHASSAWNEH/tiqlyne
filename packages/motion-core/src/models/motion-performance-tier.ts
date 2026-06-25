import type { MotionKeyframe } from './motion-keyframe';

export type MotionPerformanceTier = 'compositor' | 'paint' | 'layout' | 'unknown';

export type MotionKeyframeProperty = keyof MotionKeyframe | string;

const COMPOSITOR_PROPERTIES = ['opacity', 'transform'] as const satisfies ReadonlyArray<
  keyof MotionKeyframe
>;

const PAINT_PROPERTIES = [
  'filter',
  'boxShadow',
  'backgroundColor',
  'color',
  'borderColor',
  'outlineColor'
] as const satisfies ReadonlyArray<keyof MotionKeyframe>;

const LAYOUT_PROPERTIES = [] as const satisfies ReadonlyArray<keyof MotionKeyframe>;

export function getMotionKeyframePropertyPerformanceTier(
  property: MotionKeyframeProperty
): MotionPerformanceTier {
  if (includesProperty(COMPOSITOR_PROPERTIES, property)) {
    return 'compositor';
  }

  if (includesProperty(PAINT_PROPERTIES, property)) {
    return 'paint';
  }

  if (includesProperty(LAYOUT_PROPERTIES, property)) {
    return 'layout';
  }

  return 'unknown';
}

function includesProperty(
  properties: ReadonlyArray<string>,
  property: MotionKeyframeProperty
): boolean {
  return properties.includes(property);
}
