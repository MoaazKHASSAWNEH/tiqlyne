import type { MotionKeyframe } from '@structifyx/motion-core';

export function toWebKeyframes(
  keyframes: ReadonlyArray<MotionKeyframe>
): Keyframe[] {
  return keyframes.map((keyframe) => {
    const webKeyframe: Keyframe = {};

    if (typeof keyframe.opacity === 'number') {
      webKeyframe.opacity = keyframe.opacity;
    }

    if (typeof keyframe.transform === 'string') {
      webKeyframe.transform = keyframe.transform;
    }

    if (typeof keyframe.filter === 'string') {
      webKeyframe.filter = keyframe.filter;
    }

    if (typeof keyframe.backgroundColor === 'string') {
      webKeyframe.backgroundColor = keyframe.backgroundColor;
    }

    if (typeof keyframe.color === 'string') {
      webKeyframe.color = keyframe.color;
    }

    if (typeof keyframe.borderColor === 'string') {
      webKeyframe.borderColor = keyframe.borderColor;
    }

    if (typeof keyframe.boxShadow === 'string') {
      webKeyframe.boxShadow = keyframe.boxShadow;
    }

    if (typeof keyframe.outlineColor === 'string') {
      webKeyframe.outlineColor = keyframe.outlineColor;
    }

    if (typeof keyframe.offset === 'number') {
      webKeyframe.offset = keyframe.offset;
    }

    if (keyframe.custom) {
      for (const [property, value] of Object.entries(keyframe.custom)) {
        webKeyframe[property] = value;
      }
    }

    return webKeyframe;
  });
}