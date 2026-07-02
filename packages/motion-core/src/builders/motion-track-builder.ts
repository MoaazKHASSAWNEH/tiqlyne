import type {
  MotionStaggerDefinition,
  MotionStepDefinition,
  MotionTimelineDefaults,
  MotionTrackDefinition
} from '../models/motion-timeline';
import type { MotionStepBuilder, MotionStepBuilderOptions } from './motion-step-builder';
import { DefaultMotionStepBuilder } from './motion-step-builder';
import type { MotionTargetInput } from './normalize-motion-target-input';
import { normalizeMotionTargetInput } from './normalize-motion-target-input';

/**
 * Callback used to configure a step inside a track builder.
 */
export type MotionStepBuilderCallback = (step: MotionStepBuilder) => void;

/**
 * Fluent builder used to create a motion track.
 *
 * A track targets one or more runtime elements and contains ordered animation
 * steps for those targets.
 */
export type MotionTrackBuilder = {
  /**
   * Sets defaults applied to all steps in this track.
   *
   * @param defaults - Track-level defaults.
   * @returns The same builder for chaining.
   */
  defaults(defaults: MotionTimelineDefaults): MotionTrackBuilder;

  /**
   * Sets stagger behavior for multiple resolved targets.
   *
   * @param stagger - Stagger definition.
   * @returns The same builder for chaining.
   */
  stagger(stagger: MotionStaggerDefinition): MotionTrackBuilder;

  /**
   * Adds a step with default step options.
   *
   * @param callback - Function that configures the step builder.
   * @returns The same builder for chaining.
   */
  step(callback: MotionStepBuilderCallback): MotionTrackBuilder;

  /**
   * Adds a step with explicit step options.
   *
   * @param options - Step options such as timing, easing or position.
   * @param callback - Function that configures the step builder.
   * @returns The same builder for chaining.
   */
  step(options: MotionStepBuilderOptions, callback: MotionStepBuilderCallback): MotionTrackBuilder;

  /**
   * Builds an immutable track definition snapshot.
   *
   * @returns Track definition.
   */
  build(): MotionTrackDefinition;
};

/**
 * Default implementation of {@link MotionTrackBuilder}.
 */
export class DefaultMotionTrackBuilder implements MotionTrackBuilder {
  private readonly stepDefinitions: MotionStepDefinition[] = [];
  private trackDefaults: MotionTimelineDefaults | undefined;
  private trackStagger: MotionStaggerDefinition | undefined;

  constructor(private readonly target: MotionTargetInput) {}

  defaults(defaults: MotionTimelineDefaults): MotionTrackBuilder {
    this.trackDefaults = defaults;

    return this;
  }

  stagger(stagger: MotionStaggerDefinition): MotionTrackBuilder {
    this.trackStagger = stagger;

    return this;
  }

  step(callback: MotionStepBuilderCallback): MotionTrackBuilder;
  step(options: MotionStepBuilderOptions, callback: MotionStepBuilderCallback): MotionTrackBuilder;
  step(
    optionsOrCallback: MotionStepBuilderOptions | MotionStepBuilderCallback,
    callback?: MotionStepBuilderCallback
  ): MotionTrackBuilder {
    const options = typeof optionsOrCallback === 'function' ? {} : optionsOrCallback;

    const stepCallback = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;

    if (stepCallback === undefined) {
      throw new Error('Motion step callback is required.');
    }

    const stepBuilder = new DefaultMotionStepBuilder(options);

    stepCallback(stepBuilder);

    this.stepDefinitions.push(stepBuilder.build());

    return this;
  }

  build(): MotionTrackDefinition {
    return {
      target: normalizeMotionTargetInput(this.target),
      steps: this.stepDefinitions.map((step) => ({
        ...step,
        keyframes: step.keyframes.map((keyframe) => ({
          ...keyframe
        }))
      })),
      ...(this.trackStagger !== undefined
        ? {
            stagger: this.trackStagger
          }
        : {}),
      ...(this.trackDefaults !== undefined
        ? {
            defaults: this.trackDefaults
          }
        : {})
    };
  }
}
