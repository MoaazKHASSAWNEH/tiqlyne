export type MotionOptionType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'select'
  | 'color'
  | 'range';

export type MotionOptionUnit = 'px' | '%' | 'deg' | 'ms' | 's' | 'none';

export type NumberMotionOptionDefinition = {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly type: 'number';
  readonly defaultValue: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly unit?: MotionOptionUnit;
};

export type RangeMotionOptionDefinition = {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly type: 'range';
  readonly defaultValue: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly unit?: MotionOptionUnit;
};

export type StringMotionOptionDefinition = {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly type: 'string';
  readonly defaultValue: string;
  readonly minLength?: number;
  readonly maxLength?: number;
};

export type BooleanMotionOptionDefinition = {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly type: 'boolean';
  readonly defaultValue: boolean;
};

export type SelectMotionOptionDefinition = {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly type: 'select';
  readonly defaultValue: string;
  readonly choices: ReadonlyArray<{
    readonly label: string;
    readonly value: string;
  }>;
};

export type ColorMotionOptionDefinition = {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly type: 'color';
  readonly defaultValue: string;
};

export type MotionOptionDefinition =
  | NumberMotionOptionDefinition
  | RangeMotionOptionDefinition
  | StringMotionOptionDefinition
  | BooleanMotionOptionDefinition
  | SelectMotionOptionDefinition
  | ColorMotionOptionDefinition;