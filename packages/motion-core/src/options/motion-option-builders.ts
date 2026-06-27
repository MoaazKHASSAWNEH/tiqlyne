import type {
  BooleanMotionOptionDefinition,
  ColorMotionOptionDefinition,
  MotionOptionDefinition,
  NumberMotionOptionDefinition,
  RangeMotionOptionDefinition,
  SelectMotionOptionDefinition,
  StringMotionOptionDefinition
} from '../models/motion-option-definition';
import { normalizeBoolean } from '../utils/normalize-boolean';
import { normalizeNumber, type NormalizeNumberOptions } from '../utils/normalize-number';
import { normalizeString } from '../utils/normalize-string';

export type MotionOptionDefinitionInput =
  | Omit<NumberMotionOptionDefinition, 'name'>
  | Omit<RangeMotionOptionDefinition, 'name'>
  | Omit<StringMotionOptionDefinition, 'name'>
  | Omit<BooleanMotionOptionDefinition, 'name'>
  | Omit<SelectMotionOptionDefinition, 'name'>
  | Omit<ColorMotionOptionDefinition, 'name'>;

export type MotionOptionSchemaEntry<TValue> = {
  readonly definition: MotionOptionDefinitionInput;
  normalize(value: unknown): TValue;
};

export type SelectMotionOptionChoice<TValue extends string = string> = {
  readonly label: string;
  readonly value: TValue;
};

type NumberOptionConfig = Omit<NumberMotionOptionDefinition, 'name' | 'type'>;

type RangeOptionConfig = Omit<RangeMotionOptionDefinition, 'name' | 'type'>;

type StringOptionConfig = Omit<StringMotionOptionDefinition, 'name' | 'type'>;

type BooleanOptionConfig = Omit<BooleanMotionOptionDefinition, 'name' | 'type'>;

type ColorOptionConfig = Omit<ColorMotionOptionDefinition, 'name' | 'type'>;

type SelectOptionConfig<TChoices extends ReadonlyArray<SelectMotionOptionChoice<string>>> = Omit<
  SelectMotionOptionDefinition,
  'name' | 'type' | 'defaultValue' | 'choices'
> & {
  readonly defaultValue: TChoices[number]['value'];
  readonly choices: TChoices;
};

function createNormalizeNumberOptions(config: NumberOptionConfig): NormalizeNumberOptions {
  return {
    defaultValue: config.defaultValue,
    ...(config.min !== undefined
      ? {
          min: config.min
        }
      : {}),
    ...(config.max !== undefined
      ? {
          max: config.max
        }
      : {})
  };
}

export const option = {
  number(config: NumberOptionConfig): MotionOptionSchemaEntry<number> {
    return {
      definition: {
        ...config,
        type: 'number'
      },
      normalize(value: unknown): number {
        return normalizeNumber(value, createNormalizeNumberOptions(config));
      }
    };
  },

  range(config: RangeOptionConfig): MotionOptionSchemaEntry<number> {
    return {
      definition: {
        ...config,
        type: 'range'
      },
      normalize(value: unknown): number {
        return normalizeNumber(value, {
          defaultValue: config.defaultValue,
          min: config.min,
          max: config.max
        });
      }
    };
  },

  string(config: StringOptionConfig): MotionOptionSchemaEntry<string> {
    return {
      definition: {
        ...config,
        type: 'string'
      },
      normalize(value: unknown): string {
        return normalizeString(value, config.defaultValue);
      }
    };
  },

  boolean(config: BooleanOptionConfig): MotionOptionSchemaEntry<boolean> {
    return {
      definition: {
        ...config,
        type: 'boolean'
      },
      normalize(value: unknown): boolean {
        return normalizeBoolean(value, config.defaultValue);
      }
    };
  },

  select<const TChoices extends ReadonlyArray<SelectMotionOptionChoice<string>>>(
    config: SelectOptionConfig<TChoices>
  ): MotionOptionSchemaEntry<TChoices[number]['value']> {
    return {
      definition: {
        ...config,
        type: 'select'
      },
      normalize(value: unknown): TChoices[number]['value'] {
        const allowedValues = config.choices.map((choice) => choice.value);

        return typeof value === 'string' && allowedValues.includes(value)
          ? value
          : config.defaultValue;
      }
    };
  },

  color(config: ColorOptionConfig): MotionOptionSchemaEntry<string> {
    return {
      definition: {
        ...config,
        type: 'color'
      },
      normalize(value: unknown): string {
        return normalizeString(value, config.defaultValue);
      }
    };
  }
};

export function attachMotionOptionName(
  name: string,
  definition: MotionOptionDefinitionInput
): MotionOptionDefinition {
  switch (definition.type) {
    case 'number':
      return {
        name,
        ...definition
      };

    case 'range':
      return {
        name,
        ...definition
      };

    case 'string':
      return {
        name,
        ...definition
      };

    case 'boolean':
      return {
        name,
        ...definition
      };

    case 'select':
      return {
        name,
        ...definition
      };

    case 'color':
      return {
        name,
        ...definition
      };
  }
}
