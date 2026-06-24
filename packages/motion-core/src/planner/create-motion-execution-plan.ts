import { applyMotionTimelineDefaults } from '../compiler/apply-motion-timeline-defaults';
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
  const timeline = applyMotionTimelineDefaults(input.timeline);
  const preparedTimeline = prepareMotionTimeline(timeline);
  const scheduledTimeline = scheduleMotionTimeline(preparedTimeline);

  const reducedMotionTimeline =
    input.reducedMotionTimeline !== undefined
      ? applyMotionTimelineDefaults(input.reducedMotionTimeline)
      : undefined;

  const preparedReducedMotionTimeline =
    reducedMotionTimeline !== undefined ? prepareMotionTimeline(reducedMotionTimeline) : undefined;

  const scheduledReducedMotionTimeline =
    preparedReducedMotionTimeline !== undefined
      ? scheduleMotionTimeline(preparedReducedMotionTimeline)
      : undefined;

  const summary = createMotionExecutionPlanSummary({
    scheduledTimeline,
    ...(scheduledReducedMotionTimeline !== undefined
      ? {
          scheduledReducedMotionTimeline
        }
      : {})
  });

  return {
    timeline,
    preparedTimeline,
    scheduledTimeline,
    ...(reducedMotionTimeline !== undefined
      ? {
          reducedMotionTimeline
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
