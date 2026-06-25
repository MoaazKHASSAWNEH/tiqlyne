import type { MotionTransformValue } from './motion-transform';
import type { MotionFilterValue } from './motion-filter';

export type MotionKeyframe = {
  readonly opacity?: number;
  readonly transform?: string | MotionTransformValue;
  readonly filter?: MotionFilterValue;
  readonly backgroundColor?: string;
  readonly color?: string;
  readonly borderColor?: string;
  readonly boxShadow?: string;
  readonly outlineColor?: string;
  readonly offset?: number;
  readonly custom?: Record<string, string | number>;
};
