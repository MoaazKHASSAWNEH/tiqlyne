import type { MotionKeyframe } from '../models/motion-keyframe';
import type { MotionStepDefinition } from '../models/motion-timeline';

/**
 * Options accepted when creating a step with the builder API.
 *
 * The keyframes are configured separately through the step builder methods.
 */
export type MotionStepBuilderOptions = Omit<MotionStepDefinition, 'keyframes'>;

/**
 * Fluent builder used to create a motion step.
 *
 * A step contains one or more keyframes and optional timing/position settings.
 */
export type MotionStepBuilder = {
  /**
   * Adds one keyframe to the step.
   *
   * @param keyframe - Keyframe to append.
   * @returns The same builder for chaining.
   */
  keyframe(keyframe: MotionKeyframe): MotionStepBuilder;

  /**
   * Adds multiple keyframes to the step.
   *
   * @param keyframes - Keyframes to append in order.
   * @returns The same builder for chaining.
   */
  keyframes(keyframes: ReadonlyArray<MotionKeyframe>): MotionStepBuilder;

  /**
   * Adds a starting keyframe with `offset: 0`.
   *
   * @param keyframe - Keyframe values to use at the start of the step.
   * @returns The same builder for chaining.
   */
  from(keyframe: MotionKeyframe): MotionStepBuilder;

  /**
   * Adds an ending keyframe with `offset: 1`.
   *
   * @param keyframe - Keyframe values to use at the end of the step.
   * @returns The same builder for chaining.
   */
  to(keyframe: MotionKeyframe): MotionStepBuilder;

  /**
   * Builds an immutable step definition snapshot.
   *
   * @returns Step definition.
   */
  build(): MotionStepDefinition;
};

/**
 * Default implementation of {@link MotionStepBuilder}.
 */
export class DefaultMotionStepBuilder implements MotionStepBuilder {
  private readonly keyframeDefinitions: MotionKeyframe[] = [];

  constructor(private readonly options: MotionStepBuilderOptions = {}) {}

  keyframe(keyframe: MotionKeyframe): MotionStepBuilder {
    this.keyframeDefinitions.push({
      ...keyframe
    });

    return this;
  }

  keyframes(keyframes: ReadonlyArray<MotionKeyframe>): MotionStepBuilder {
    for (const keyframe of keyframes) {
      this.keyframe(keyframe);
    }

    return this;
  }

  from(keyframe: MotionKeyframe): MotionStepBuilder {
    return this.keyframe({
      ...keyframe,
      offset: 0
    });
  }

  to(keyframe: MotionKeyframe): MotionStepBuilder {
    return this.keyframe({
      ...keyframe,
      offset: 1
    });
  }

  build(): MotionStepDefinition {
    return {
      ...this.options,
      keyframes: this.keyframeDefinitions.map((keyframe) => ({
        ...keyframe
      }))
    };
  }
}
