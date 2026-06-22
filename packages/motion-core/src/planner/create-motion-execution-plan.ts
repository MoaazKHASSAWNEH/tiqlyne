import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionTimelineDefinition } from '../models/motion-timeline';

export type CreateMotionExecutionPlanInput = {
  readonly timeline: MotionTimelineDefinition;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};

export function createMotionExecutionPlan(
  input: CreateMotionExecutionPlanInput
): MotionExecutionPlan {
  const preparedTimeline = prepareMotionTimeline(input.timeline);

  const preparedReducedMotionTimeline =
    input.reducedMotionTimeline !== undefined
      ? prepareMotionTimeline(input.reducedMotionTimeline)
      : undefined;

  return {
    timeline: input.timeline,
    preparedTimeline,
    ...(input.reducedMotionTimeline !== undefined
      ? {
          reducedMotionTimeline: input.reducedMotionTimeline
        }
      : {}),
    ...(preparedReducedMotionTimeline !== undefined
      ? {
          preparedReducedMotionTimeline
        }
      : {}),
    diagnostics: input.diagnostics ?? []
  };
}
