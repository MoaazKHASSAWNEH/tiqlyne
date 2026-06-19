export type MotionKeyframe = {
  readonly opacity?: number;
  readonly transform?: string;
  readonly filter?: string;
  readonly backgroundColor?: string;
  readonly color?: string;
  readonly borderColor?: string;
  readonly boxShadow?: string;
  readonly outlineColor?: string;
  readonly offset?: number;
  readonly custom?: Record<string, string | number>;
};
