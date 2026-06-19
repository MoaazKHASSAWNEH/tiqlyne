export type MotionTargetReference =
  | {
      readonly type: 'self';
    }
  | {
      readonly type: 'child';
      readonly name: string;
    }
  | {
      readonly type: 'selector';
      readonly selector: string;
    }
  | {
      readonly type: 'named';
      readonly name: string;
    };
