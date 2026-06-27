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

export abstract class SchemaMotionDefinition<
  TSchema extends MotionOptionsSchema
> implements MotionDefinition<InferMotionOptions<TSchema>> {
  abstract readonly type: string;
  abstract readonly label: string;
  abstract readonly description: string;
  abstract readonly category: MotionCategory;

  protected abstract readonly options: DefinedMotionOptions<TSchema>;

  protected readonly validators: ReadonlyArray<MotionOptionValidator<InferMotionOptions<TSchema>>> =
    [];

  get optionDefinitions(): ReadonlyArray<MotionOptionDefinition> {
    return this.options.optionDefinitions;
  }

  getDefaultOptions(): InferMotionOptions<TSchema> {
    return this.options.getDefaultOptions();
  }

  normalizeOptions(options: Record<string, unknown> | undefined): InferMotionOptions<TSchema> {
    return this.options.normalizeOptions(options);
  }

  validateOptions(options: InferMotionOptions<TSchema>): ReadonlyArray<string> {
    return runMotionOptionValidators(options, this.validators);
  }

  abstract buildTimeline(
    context: MotionBuildContext<InferMotionOptions<TSchema>>
  ): MotionTimelineDefinition;

  buildReducedMotionTimeline?(
    context: MotionBuildContext<InferMotionOptions<TSchema>>
  ): MotionTimelineDefinition;
}
