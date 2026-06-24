export type MotionLengthUnit = 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh';

export type MotionLengthString =
  | `${number}px`
  | `${number}%`
  | `${number}rem`
  | `${number}em`
  | `${number}vw`
  | `${number}vh`;

export type MotionLengthValue = number | MotionLengthString;

export type MotionAngleString = `${number}deg` | `${number}rad` | `${number}turn`;

export type MotionAngleValue = number | MotionAngleString;

export type MotionTransformOrigin =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top left'
  | 'top center'
  | 'top right'
  | 'center left'
  | 'center right'
  | 'bottom left'
  | 'bottom center'
  | 'bottom right'
  | string;

export type MotionTransformValue = {
  readonly x?: MotionLengthValue;
  readonly y?: MotionLengthValue;
  readonly z?: MotionLengthValue;

  readonly translateX?: MotionLengthValue;
  readonly translateY?: MotionLengthValue;
  readonly translateZ?: MotionLengthValue;

  readonly scale?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly scaleZ?: number;

  readonly rotate?: MotionAngleValue;
  readonly rotateX?: MotionAngleValue;
  readonly rotateY?: MotionAngleValue;
  readonly rotateZ?: MotionAngleValue;

  readonly skewX?: MotionAngleValue;
  readonly skewY?: MotionAngleValue;

  readonly perspective?: MotionLengthValue;
  readonly origin?: MotionTransformOrigin;
};
