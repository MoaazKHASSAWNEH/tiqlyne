import type { MotionOptionDefinition } from '../models/motion-option-definition';
import { attachMotionOptionName } from './motion-option-builders';
import type { InferMotionOptions, MotionOptionsSchema } from './infer-motion-options';
import { normalizeMotionOptions } from './normalize-motion-options';

export type DefinedMotionOptions<TSchema extends MotionOptionsSchema> = {
  readonly schema: TSchema;
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition>;
  getDefaultOptions(): InferMotionOptions<TSchema>;
  normalizeOptions(options: Record<string, unknown> | undefined): InferMotionOptions<TSchema>;
};

export function defineMotionOptions<TSchema extends MotionOptionsSchema>(
  schema: TSchema
): DefinedMotionOptions<TSchema> {
  const optionDefinitions = Object.keys(schema).map((name) => {
    const entry = schema[name];

    if (entry === undefined) {
      throw new Error(`Motion option "${name}" is not defined.`);
    }

    return attachMotionOptionName(name, entry.definition);
  });

  return {
    schema,
    optionDefinitions,

    getDefaultOptions(): InferMotionOptions<TSchema> {
      return normalizeMotionOptions(schema, undefined);
    },

    normalizeOptions(options: Record<string, unknown> | undefined): InferMotionOptions<TSchema> {
      return normalizeMotionOptions(schema, options);
    }
  };
}
