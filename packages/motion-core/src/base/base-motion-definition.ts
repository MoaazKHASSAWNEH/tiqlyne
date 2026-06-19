import type {
  MotionBuildContext,
  MotionDefinition
} from '../contracts/motion-definition';
import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export abstract class BaseMotionDefinition<TOptions extends object>
  implements MotionDefinition<TOptions>
{
  abstract readonly type: string;
  abstract readonly label: string;
  abstract readonly description: string;
  abstract readonly category: MotionCategory;
  abstract readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition>;

  abstract getDefaultOptions(): TOptions;

  abstract normalizeOptions(
    options: Record<string, unknown> | undefined
  ): TOptions;

  validateOptions(_options: TOptions): ReadonlyArray<string> {
    return [];
  }

  abstract buildTimeline(
    context: MotionBuildContext<TOptions>
  ): MotionTimelineDefinition;
}