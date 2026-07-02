import type { MotionBuildContext, MotionDefinition } from '../contracts/motion-definition';
import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type { DefinedMotionOptions } from '../options/define-motion-options';
import type { InferMotionOptions, MotionOptionsSchema } from '../options/infer-motion-options';
import {
  runMotionOptionValidators,
  type MotionOptionValidator
} from '../options/motion-option-validator';

/**
 * Schema-based base class for creating strongly typed motion definitions.
 *
 * This class connects the `defineMotionOptions` API with the public
 * {@link MotionDefinition} contract. It automatically exposes option
 * definitions, default options and normalization logic from the schema.
 *
 * @typeParam TSchema - Options schema created with `defineMotionOptions`.
 */
export abstract class SchemaMotionDefinition<
  TSchema extends MotionOptionsSchema
> implements MotionDefinition<InferMotionOptions<TSchema>> {
  /**
   * Unique motion type used by configs and registries.
   */
  abstract readonly type: string;

  /**
   * Human-readable motion label.
   */
  abstract readonly label: string;

  /**
   * Short human-readable description.
   */
  abstract readonly description: string;

  /**
   * Motion category used by registries and builders.
   */
  abstract readonly category: MotionCategory;

  /**
   * Schema-backed options helper created with `defineMotionOptions`.
   */
  protected abstract readonly options: DefinedMotionOptions<TSchema>;

  /**
   * Optional validators executed after option normalization.
   */
  protected readonly optionValidators: ReadonlyArray<
    MotionOptionValidator<InferMotionOptions<TSchema>>
  > = [];

  /**
   * Builder-friendly option definitions exposed by this motion.
   */
  get optionDefinitions(): ReadonlyArray<MotionOptionDefinition> {
    return this.options.optionDefinitions;
  }

  /**
   * Returns default options inferred from the schema.
   */
  getDefaultOptions(): InferMotionOptions<TSchema> {
    return this.options.getDefaultOptions();
  }

  /**
   * Normalizes raw user options using the schema.
   */
  normalizeOptions(options: Record<string, unknown> | undefined): InferMotionOptions<TSchema> {
    return this.options.normalizeOptions(options);
  }

  /**
   * Validates normalized options using configured validators.
   */
  validateOptions(options: InferMotionOptions<TSchema>): ReadonlyArray<string> {
    return runMotionOptionValidators(options, this.optionValidators);
  }

  /**
   * Builds the timeline for this motion.
   */
  abstract buildTimeline(
    context: MotionBuildContext<InferMotionOptions<TSchema>>
  ): MotionTimelineDefinition;

  /**
   * Optionally builds a simplified timeline for reduced-motion mode.
   */
  buildReducedMotionTimeline?(
    context: MotionBuildContext<InferMotionOptions<TSchema>>
  ): MotionTimelineDefinition;
}
