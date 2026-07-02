import type {
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTrackDefinition
} from '../models/motion-timeline';
import type { MotionTargetInput } from './normalize-motion-target-input';
import { DefaultMotionTrackBuilder } from './motion-track-builder';
import type { MotionTrackBuilder } from './motion-track-builder';

/**
 * Callback used to configure a track inside a timeline builder.
 */
export type MotionTrackBuilderCallback = (track: MotionTrackBuilder) => void;

/**
 * Fluent builder used to create a {@link MotionTimelineDefinition}.
 */
export type MotionTimelineBuilder = {
  /**
   * Sets defaults applied at timeline level.
   *
   * @param defaults - Timeline-level defaults.
   * @returns The same builder for chaining.
   */
  defaults(defaults: MotionTimelineDefaults): MotionTimelineBuilder;

  /**
   * Adds a named label at a timeline position.
   *
   * Labels can later be used by playback controllers through `jumpToLabel`.
   *
   * @param name - Label name.
   * @param position - Label position in milliseconds.
   * @returns The same builder for chaining.
   */
  label(name: string, position: number): MotionTimelineBuilder;

  /**
   * Adds a track targeting one or more runtime elements.
   *
   * @param target - Target input for the track.
   * @param callback - Function that configures the track builder.
   * @returns The same builder for chaining.
   */
  track(target: MotionTargetInput, callback: MotionTrackBuilderCallback): MotionTimelineBuilder;

  /**
   * Builds an immutable timeline definition snapshot.
   *
   * @returns Timeline definition.
   */
  build(): MotionTimelineDefinition;
};

/**
 * Default implementation of {@link MotionTimelineBuilder}.
 */
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
