import { isRecord } from '../utils/is-record';
import type { InferMotionOptions, MotionOptionsSchema } from './infer-motion-options';

export function normalizeMotionOptions<TSchema extends MotionOptionsSchema>(
  schema: TSchema,
  options: Record<string, unknown> | undefined
): InferMotionOptions<TSchema> {
  const rawOptions = isRecord(options) ? options : {};
  const normalizedOptions: Record<string, unknown> = {};

  for (const key of Object.keys(schema)) {
    const entry = schema[key];

    if (entry !== undefined) {
      normalizedOptions[key] = entry.normalize(rawOptions[key]);
    }
  }

  return normalizedOptions as InferMotionOptions<TSchema>;
}
