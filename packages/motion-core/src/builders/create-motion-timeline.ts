import { DefaultMotionTimelineBuilder } from './motion-timeline-builder';
import type { MotionTimelineBuilder } from './motion-timeline-builder';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export type MotionTimelineBuilderCallback = (timeline: MotionTimelineBuilder) => void;

export function createMotionTimeline(
  callback: MotionTimelineBuilderCallback
): MotionTimelineDefinition {
  const builder = createMotionTimelineBuilder();

  callback(builder);

  return builder.build();
}

export function createMotionTimelineBuilder(): MotionTimelineBuilder {
  return new DefaultMotionTimelineBuilder();
}
