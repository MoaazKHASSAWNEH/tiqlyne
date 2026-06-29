import type {
  MotionCompositionDefinition,
  MotionCompositionItem,
  RegisteredMotionCompositionItem,
  TimelineCompositionItem
} from './motion-composition-definition';
import type { MotionTargetReference } from '../models/motion-target';
import type {
  MotionStepPosition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTimelineLabels
} from '../models/motion-timeline';

export type MotionCompositionMotionInput = {
  readonly label?: string;
  readonly target?: MotionTargetReference;
  readonly options?: Record<string, unknown>;
  readonly at?: MotionStepPosition;
  readonly defaults?: MotionTimelineDefaults;
};

export type MotionCompositionTimelineInput = {
  readonly label?: string;
  readonly target?: MotionTargetReference;
  readonly at?: MotionStepPosition;
  readonly defaults?: MotionTimelineDefaults;
};

export class MotionCompositionBuilder {
  private compositionDefaults: MotionTimelineDefaults | undefined;
  private compositionLabels: MotionTimelineLabels | undefined;
  private readonly compositionItems: MotionCompositionItem[] = [];

  defaults(defaults: MotionTimelineDefaults): this {
    this.compositionDefaults = {
      ...(this.compositionDefaults ?? {}),
      ...defaults
    };

    return this;
  }

  label(name: string, position: number): this {
    this.compositionLabels = {
      ...(this.compositionLabels ?? {}),
      [name]: position
    };

    return this;
  }

  labels(labels: MotionTimelineLabels): this {
    this.compositionLabels = {
      ...(this.compositionLabels ?? {}),
      ...labels
    };

    return this;
  }

  motion(type: string, input: MotionCompositionMotionInput = {}): this {
    const item: RegisteredMotionCompositionItem = {
      kind: 'motion',
      type,
      ...(input.label !== undefined
        ? {
            label: input.label
          }
        : {}),
      ...(input.target !== undefined
        ? {
            target: input.target
          }
        : {}),
      ...(input.options !== undefined
        ? {
            options: input.options
          }
        : {}),
      ...(input.at !== undefined
        ? {
            at: input.at
          }
        : {}),
      ...(input.defaults !== undefined
        ? {
            defaults: input.defaults
          }
        : {})
    };

    this.compositionItems.push(item);

    return this;
  }

  timeline(timeline: MotionTimelineDefinition, input: MotionCompositionTimelineInput = {}): this {
    const item: TimelineCompositionItem = {
      kind: 'timeline',
      timeline,
      ...(input.label !== undefined
        ? {
            label: input.label
          }
        : {}),
      ...(input.target !== undefined
        ? {
            target: input.target
          }
        : {}),
      ...(input.at !== undefined
        ? {
            at: input.at
          }
        : {}),
      ...(input.defaults !== undefined
        ? {
            defaults: input.defaults
          }
        : {})
    };

    this.compositionItems.push(item);

    return this;
  }

  build(): MotionCompositionDefinition {
    return {
      items: [...this.compositionItems],
      ...(this.compositionDefaults !== undefined
        ? {
            defaults: this.compositionDefaults
          }
        : {}),
      ...(this.compositionLabels !== undefined
        ? {
            labels: this.compositionLabels
          }
        : {})
    };
  }
}
