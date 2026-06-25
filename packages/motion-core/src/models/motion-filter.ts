import type { MotionAngleValue, MotionLengthValue } from './motion-transform';

export type MotionFilterValue =
  | string
  | {
      readonly blur?: MotionLengthValue;
      readonly brightness?: number;
      readonly contrast?: number;
      readonly grayscale?: number;
      readonly hueRotate?: MotionAngleValue;
      readonly invert?: number;
      readonly opacity?: number;
      readonly saturate?: number;
      readonly sepia?: number;
      readonly dropShadow?: string;
    };
