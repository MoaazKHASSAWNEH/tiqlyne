import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { DefaultMotionTimelineBuilder } from './motion-timeline-builder';
import type { MotionTimelineBuilder } from './motion-timeline-builder';

/**
 * Callback used by {@link createMotionTimeline}.
 *
 * The callback receives a fluent timeline builder and should add labels,
 * tracks and steps before the timeline is built.
 */
export type MotionTimelineBuilderCallback = (timeline: MotionTimelineBuilder) => void;

/**
 * Creates a motion timeline using the fluent builder API.
 *
 * This helper is useful for application code and tests that prefer a readable
 * builder style instead of manually creating timeline objects.
 *
 * @param callback - Function that receives and configures the timeline builder.
 * @returns Built timeline definition.
 */
export function createMotionTimeline(
  callback: MotionTimelineBuilderCallback
): MotionTimelineDefinition {
  const builder = createMotionTimelineBuilder();

  callback(builder);

  return builder.build();
}

/**
 * Creates an empty timeline builder.
 *
 * @returns A new timeline builder instance.
 */
export function createMotionTimelineBuilder(): MotionTimelineBuilder {
  return new DefaultMotionTimelineBuilder();
}
