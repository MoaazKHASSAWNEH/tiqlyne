import { applyMotionTimelineDefaults } from '../compiler/apply-motion-timeline-defaults';
import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionExecutionPlan } from '../models/motion-execution-plan';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { scheduleMotionTimeline } from '../scheduler/schedule-motion-timeline';
import { createMotionExecutionPlanSummary } from './create-motion-execution-plan-summary';

/**
 * Input used to create a motion execution plan.
 */
export type CreateMotionExecutionPlanInput = {
  /**
   * Main timeline to prepare and schedule.
   */
  readonly timeline: MotionTimelineDefinition;

  /**
   * Optional reduced-motion timeline to prepare and schedule.
   */
  readonly reducedMotionTimeline?: MotionTimelineDefinition;

  /**
   * Optional diagnostics to attach to the plan.
   */
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};

/**
 * Creates a complete execution plan from a timeline.
 *
 * The planner applies timeline defaults, prepares the timeline, schedules
 * executable tasks, prepares the optional reduced-motion timeline and creates
 * a compact summary.
 *
 * This function does not execute animations. Drivers receive the resulting plan
 * through engine play options and can inspect it if needed.
 *
 * @param input - Timeline planning input.
 * @returns Complete execution plan.
 */
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
