/**
 * Supported option field types for motion definitions.
 *
 * These types are builder-friendly: a visual builder can use them to generate
 * configuration forms automatically.
 */
export type MotionOptionType = 'number' | 'string' | 'boolean' | 'select' | 'color' | 'range';

/**
 * Unit displayed by tools and builders for numeric motion options.
 */
export type MotionOptionUnit = 'px' | '%' | 'deg' | 'ms' | 's' | 'none';

/**
 * Shared fields available on every motion option definition.
 */
export type MotionOptionDefinitionBase = {
  /**
   * Machine-readable option name.
   */
  readonly name: string;

  /**
   * Human-readable label displayed in builders or documentation.
   */
  readonly label: string;

  /**
   * Optional help text.
   */
  readonly description?: string;
};

/**
 * Numeric option definition.
 */
export type NumberMotionOptionDefinition = MotionOptionDefinitionBase & {
  /**
   * Option type discriminator.
   */
  readonly type: 'number';

  /**
   * Default numeric value.
   */
  readonly defaultValue: number;

  /**
   * Optional minimum value.
   */
  readonly min?: number;

  /**
   * Optional maximum value.
   */
  readonly max?: number;

  /**
   * Optional numeric step.
   */
  readonly step?: number;

  /**
   * Optional display unit.
   */
  readonly unit?: MotionOptionUnit;
};

/**
 * Range option definition, typically rendered as a slider.
 */
export type RangeMotionOptionDefinition = MotionOptionDefinitionBase & {
  /**
   * Option type discriminator.
   */
  readonly type: 'range';

  /**
   * Default numeric value.
   */
  readonly defaultValue: number;

  /**
   * Required minimum slider value.
   */
  readonly min: number;

  /**
   * Required maximum slider value.
   */
  readonly max: number;

  /**
   * Optional slider step.
   */
  readonly step?: number;

  /**
   * Optional display unit.
   */
  readonly unit?: MotionOptionUnit;
};

/**
 * String option definition.
 */
export type StringMotionOptionDefinition = MotionOptionDefinitionBase & {
  /**
   * Option type discriminator.
   */
  readonly type: 'string';

  /**
   * Default string value.
   */
  readonly defaultValue: string;

  /**
   * Optional minimum string length.
   */
  readonly minLength?: number;

  /**
   * Optional maximum string length.
   */
  readonly maxLength?: number;
};

/**
 * Boolean option definition, typically rendered as a checkbox or switch.
 */
export type BooleanMotionOptionDefinition = MotionOptionDefinitionBase & {
  /**
   * Option type discriminator.
   */
  readonly type: 'boolean';

  /**
   * Default boolean value.
   */
  readonly defaultValue: boolean;
};

/**
 * One selectable choice for a select option.
 */
export type SelectMotionOptionChoice = {
  /**
   * Human-readable choice label.
   */
  readonly label: string;

  /**
   * Machine-readable choice value.
   */
  readonly value: string;
};

/**
 * Select option definition.
 */
export type SelectMotionOptionDefinition = MotionOptionDefinitionBase & {
  /**
   * Option type discriminator.
   */
  readonly type: 'select';

  /**
   * Default selected value.
   */
  readonly defaultValue: string;

  /**
   * Available choices.
   */
  readonly choices: ReadonlyArray<SelectMotionOptionChoice>;
};

/**
 * Color option definition.
 */
export type ColorMotionOptionDefinition = MotionOptionDefinitionBase & {
  /**
   * Option type discriminator.
   */
  readonly type: 'color';

  /**
   * Default color value.
   */
  readonly defaultValue: string;
};

/**
 * Union of all supported motion option definitions.
 *
 * Motion definitions expose these objects so builders can generate their option
 * UI without custom code for each animation.
 */
export type MotionOptionDefinition =
  | NumberMotionOptionDefinition
  | RangeMotionOptionDefinition
  | StringMotionOptionDefinition
  | BooleanMotionOptionDefinition
  | SelectMotionOptionDefinition
  | ColorMotionOptionDefinition;
