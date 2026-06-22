import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { scheduleMotionTimeline } from '../scheduler/schedule-motion-timeline';
import { createMotionExecutionPlanSummary } from './create-motion-execution-plan-summary';

export type CreateMotionExecutionPlanInput = {
  readonly timeline: MotionTimelineDefinition;
  readonly reducedMotionTimeline?: MotionTimelineDefinition;
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};

export function createMotionExecutionPlan(
  input: CreateMotionExecutionPlanInput
): MotionExecutionPlan {
  const preparedTimeline = prepareMotionTimeline(input.timeline);
  const scheduledTimeline = scheduleMotionTimeline(preparedTimeline);

  const preparedReducedMotionTimeline =
    input.reducedMotionTimeline !== undefined
      ? prepareMotionTimeline(input.reducedMotionTimeline)
      : undefined;

  const scheduledReducedMotionTimeline =
    preparedReducedMotionTimeline !== undefined
      ? scheduleMotionTimeline(preparedReducedMotionTimeline)
      : undefined;

  const summary = createMotionExecutionPlanSummary({
    preparedTimeline,
    scheduledTimeline,
    ...(preparedReducedMotionTimeline !== undefined
      ? {
          preparedReducedMotionTimeline
        }
      : {}),
    ...(scheduledReducedMotionTimeline !== undefined
      ? {
          scheduledReducedMotionTimeline
        }
      : {})
  });

  return {
    timeline: input.timeline,
    preparedTimeline,
    scheduledTimeline,
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
    ...(scheduledReducedMotionTimeline !== undefined
      ? {
          scheduledReducedMotionTimeline
        }
      : {}),
    summary,
    diagnostics: input.diagnostics ?? []
  };
}
