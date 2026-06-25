import { DefaultMotionStepBuilder } from './motion-step-builder';
import { normalizeMotionTargetInput } from './normalize-motion-target-input';
import type { MotionTargetInput } from './normalize-motion-target-input';
import type { MotionStepBuilder, MotionStepBuilderOptions } from './motion-step-builder';
import type {
  MotionStaggerDefinition,
  MotionStepDefinition,
  MotionTimelineDefaults,
  MotionTrackDefinition
} from '../models/motion-timeline';

export type MotionStepBuilderCallback = (step: MotionStepBuilder) => void;

export type MotionTrackBuilder = {
  defaults(defaults: MotionTimelineDefaults): MotionTrackBuilder;
  stagger(stagger: MotionStaggerDefinition): MotionTrackBuilder;
  step(callback: MotionStepBuilderCallback): MotionTrackBuilder;
  step(options: MotionStepBuilderOptions, callback: MotionStepBuilderCallback): MotionTrackBuilder;
  build(): MotionTrackDefinition;
};

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
