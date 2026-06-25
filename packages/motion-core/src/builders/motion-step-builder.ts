import type { MotionKeyframe } from '../models/motion-keyframe';
import type { MotionStepDefinition } from '../models/motion-timeline';

export type MotionStepBuilderOptions = Omit<MotionStepDefinition, 'keyframes'>;

export type MotionStepBuilder = {
  keyframe(keyframe: MotionKeyframe): MotionStepBuilder;
  keyframes(keyframes: ReadonlyArray<MotionKeyframe>): MotionStepBuilder;
  from(keyframe: MotionKeyframe): MotionStepBuilder;
  to(keyframe: MotionKeyframe): MotionStepBuilder;
  build(): MotionStepDefinition;
};

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
