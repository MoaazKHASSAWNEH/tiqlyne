import { DefaultMotionTrackBuilder } from './motion-track-builder';
import type { MotionTargetInput } from './normalize-motion-target-input';
import type { MotionTrackBuilder } from './motion-track-builder';
import type {
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTrackDefinition
} from '../models/motion-timeline';

export type MotionTrackBuilderCallback = (track: MotionTrackBuilder) => void;

export type MotionTimelineBuilder = {
  defaults(defaults: MotionTimelineDefaults): MotionTimelineBuilder;
  label(name: string, position: number): MotionTimelineBuilder;
  track(target: MotionTargetInput, callback: MotionTrackBuilderCallback): MotionTimelineBuilder;
  build(): MotionTimelineDefinition;
};

export class DefaultMotionTimelineBuilder implements MotionTimelineBuilder {
  private readonly trackDefinitions: MotionTrackDefinition[] = [];
  private readonly timelineLabels: Record<string, number> = {};
  private timelineDefaults: MotionTimelineDefaults | undefined;

  defaults(defaults: MotionTimelineDefaults): MotionTimelineBuilder {
    this.timelineDefaults = defaults;

    return this;
  }

  label(name: string, position: number): MotionTimelineBuilder {
    this.timelineLabels[name] = position;

    return this;
  }

  track(target: MotionTargetInput, callback: MotionTrackBuilderCallback): MotionTimelineBuilder {
    const trackBuilder = new DefaultMotionTrackBuilder(target);

    callback(trackBuilder);

    this.trackDefinitions.push(trackBuilder.build());

    return this;
  }

  build(): MotionTimelineDefinition {
    const labels = { ...this.timelineLabels };
    const hasLabels = Object.keys(labels).length > 0;

    return {
      tracks: this.trackDefinitions.map((track) => ({
        ...track,
        steps: track.steps.map((step) => ({
          ...step,
          keyframes: step.keyframes.map((keyframe) => ({
            ...keyframe
          }))
        }))
      })),
      ...(this.timelineDefaults !== undefined
        ? {
            defaults: this.timelineDefaults
          }
        : {}),
      ...(hasLabels
        ? {
            labels
          }
        : {})
    };
  }
}
