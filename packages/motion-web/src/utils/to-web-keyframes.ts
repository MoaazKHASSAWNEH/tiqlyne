import type { MotionKeyframe } from '@structifyx/motion-core';
import type { MotionTransformValue } from '@structifyx/motion-core';

export function toWebKeyframes(keyframes: ReadonlyArray<MotionKeyframe>): Keyframe[] {
  return keyframes.map((keyframe) => {
    const webKeyframe: Keyframe = {};

    if (typeof keyframe.opacity === 'number') {
      webKeyframe.opacity = keyframe.opacity;
    }

    if (keyframe.transform !== undefined) {
      const transform = toWebTransform(keyframe.transform);

      if (transform !== undefined) {
        webKeyframe.transform = transform;
      }

      if (typeof keyframe.transform === 'object' && keyframe.transform.origin !== undefined) {
        webKeyframe.transformOrigin = keyframe.transform.origin;
      }
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

type WebTransformInput = NonNullable<Parameters<typeof toWebTransform>[0]>;

function toWebTransform(transform: string | MotionTransformValue): string | undefined {
  if (typeof transform === 'string') {
    return transform;
  }

  const parts: string[] = [];

  appendLengthTransform(parts, 'perspective', transform.perspective);

  appendLengthTransform(parts, 'translateX', transform.x ?? transform.translateX);
  appendLengthTransform(parts, 'translateY', transform.y ?? transform.translateY);
  appendLengthTransform(parts, 'translateZ', transform.z ?? transform.translateZ);

  appendScaleTransform(parts, 'scale', transform.scale);
  appendScaleTransform(parts, 'scaleX', transform.scaleX);
  appendScaleTransform(parts, 'scaleY', transform.scaleY);
  appendScaleTransform(parts, 'scaleZ', transform.scaleZ);

  appendAngleTransform(parts, 'rotate', transform.rotate);
  appendAngleTransform(parts, 'rotateX', transform.rotateX);
  appendAngleTransform(parts, 'rotateY', transform.rotateY);
  appendAngleTransform(parts, 'rotateZ', transform.rotateZ);

  appendAngleTransform(parts, 'skewX', transform.skewX);
  appendAngleTransform(parts, 'skewY', transform.skewY);

  return parts.length > 0 ? parts.join(' ') : undefined;
}

function appendLengthTransform(
  parts: string[],
  name: string,
  value: string | number | undefined
): void {
  if (value === undefined) {
    return;
  }

  parts.push(`${name}(${toWebLength(value)})`);
}

function appendScaleTransform(parts: string[], name: string, value: number | undefined): void {
  if (value === undefined) {
    return;
  }

  parts.push(`${name}(${value})`);
}

function appendAngleTransform(
  parts: string[],
  name: string,
  value: string | number | undefined
): void {
  if (value === undefined) {
    return;
  }

  parts.push(`${name}(${toWebAngle(value)})`);
}

function toWebLength(value: string | number): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value;
}

function toWebAngle(value: string | number): string {
  if (typeof value === 'number') {
    return `${value}deg`;
  }

  return value;
}
