import type { MotionOptionSchemaEntry } from './motion-option-builders';

export type MotionOptionsSchema = Readonly<Record<string, MotionOptionSchemaEntry<unknown>>>;

export type InferMotionOptions<TSchema extends MotionOptionsSchema> = {
  readonly [TKey in keyof TSchema]: TSchema[TKey] extends MotionOptionSchemaEntry<infer TValue>
    ? TValue
    : never;
};
