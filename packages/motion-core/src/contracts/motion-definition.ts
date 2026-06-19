import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export type MotionBuildContext<TOptions extends object> = {
  readonly options: TOptions;
  readonly duration: number;
  readonly delay: number;
  readonly easing: string;
  readonly trigger: string;
};

export interface MotionDefinition<TOptions extends object = object> {
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly category: MotionCategory;
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition>;

  getDefaultOptions(): TOptions;

  normalizeOptions(options: Record<string, unknown> | undefined): TOptions;

  validateOptions?(options: TOptions): ReadonlyArray<string>;

  buildTimeline(context: MotionBuildContext<TOptions>): MotionTimelineDefinition;
}