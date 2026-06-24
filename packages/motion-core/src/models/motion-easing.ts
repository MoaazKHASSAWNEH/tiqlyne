export type MotionEasingKeyword = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export type MotionCubicBezierEasing = {
  readonly type: 'cubicBezier';
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
};

export type MotionStepsEasingPosition = 'start' | 'end';

export type MotionStepsEasing = {
  readonly type: 'steps';
  readonly count: number;
  readonly position?: MotionStepsEasingPosition;
};

export type MotionEasing = MotionEasingKeyword | MotionCubicBezierEasing | MotionStepsEasing;
