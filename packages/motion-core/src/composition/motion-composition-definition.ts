import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionTargetReference } from '../models/motion-target';
import type {
  MotionStepPosition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTimelineLabels
} from '../models/motion-timeline';
import type { MotionValidationOptions } from '../models/motion-validation-options';

/**
 * Declarative composition made of registered motion items and direct timeline items.
 *
 * A composition is compiled into a timeline before being planned or played.
 */
export type MotionCompositionDefinition = {
  /**
   * Defaults applied when compiling the composition.
   */
  readonly defaults?: MotionTimelineDefaults;

  /**
   * Labels exposed on the compiled timeline.
   */
  readonly labels?: MotionTimelineLabels;

  /**
   * Ordered composition items.
   */
  readonly items: ReadonlyArray<MotionCompositionItem>;
};

/**
 * Item that can appear inside a motion composition.
 */
export type MotionCompositionItem = RegisteredMotionCompositionItem | TimelineCompositionItem;

/**
 * Composition item referencing a registered motion definition.
 */
export type RegisteredMotionCompositionItem = {
  /**
   * Discriminator for registered motion items.
   */
  readonly kind: 'motion';

  /**
   * Registered motion type to use.
   */
  readonly type: string;

  /**
   * Optional label attached to this composition item.
   */
  readonly label?: string;

  /**
   * Optional target override for this item.
   */
  readonly target?: MotionTargetReference;

  /**
   * Options passed to the registered motion definition.
   */
  readonly options?: Record<string, unknown>;

  /**
   * Position of this item inside the composition timeline.
   */
  readonly at?: MotionStepPosition;

  /**
   * Defaults applied to the generated item timeline.
   */
  readonly defaults?: MotionTimelineDefaults;
};

/**
 * Composition item embedding a direct timeline.
 */
export type TimelineCompositionItem = {
  /**
   * Discriminator for direct timeline items.
   */
  readonly kind: 'timeline';

  /**
   * Timeline to insert into the composition.
   */
  readonly timeline: MotionTimelineDefinition;

  /**
   * Optional label attached to this composition item.
   */
  readonly label?: string;

  /**
   * Optional target override for this item.
   */
  readonly target?: MotionTargetReference;

  /**
   * Position of this item inside the composition timeline.
   */
  readonly at?: MotionStepPosition;

  /**
   * Defaults applied to the embedded timeline.
   */
  readonly defaults?: MotionTimelineDefaults;
};

/**
 * Context used when compiling a composition into a timeline.
 */
export type CompileMotionCompositionContext = {
  /**
   * Registry used to resolve registered motion items.
   */
  readonly registry: MotionRegistry;

  /**
   * Optional defaults applied during compilation.
   */
  readonly defaults?: MotionTimelineDefaults;

  /**
   * Optional validation options used while compiling.
   */
  readonly validation?: MotionValidationOptions;
};
