export { BaseMotionPlaybackController } from './controllers/base-motion-playback-controller';

export type {
  MotionPlaybackEvent,
  MotionPlaybackEventListener,
  MotionPlaybackEventType
} from './models/motion-playback-event';

export type { MotionConfigNormalizer } from './contracts/motion-config-normalizer';

export { DefaultMotionConfigNormalizer } from './normalizer/default-motion-config-normalizer';

export { clamp } from './utils/clamp';
export { isTerminalPlaybackStatus } from './utils/is-terminal-playback-status';
export { isRecord } from './utils/is-record';
export { normalizeBoolean } from './utils/normalize-boolean';
export { normalizeNumber } from './utils/normalize-number';
export { normalizeString } from './utils/normalize-string';

export type { MotionRegistry } from './contracts/motion-registry';

export { DefaultMotionRegistry } from './registry/default-motion-registry';

export type { MotionDriver, MotionPlayOptions } from './contracts/motion-driver';

export { NoopMotionDriver } from './drivers/noop-motion-driver';
export { TestMotionDriver, type TestMotionDriverCall } from './drivers/test-motion-driver';

export type { MotionEngine } from './contracts/motion-engine';

export {
  DefaultMotionEngine,
  type DefaultMotionEngineDependencies
} from './engine/default-motion-engine';

export { MotionEngineError } from './engine/motion-engine-error';

export type { MotionDefinition, MotionBuildContext } from './contracts/motion-definition';

export { BaseMotionDefinition } from './base/base-motion-definition';

export type { MotionCategory } from './models/motion-category';
export type { MotionConfig } from './models/motion-config';
export type { MotionKeyframe } from './models/motion-keyframe';
export type {
  MotionOptionDefinition,
  MotionOptionType,
  MotionOptionUnit
} from './models/motion-option-definition';
export type { MotionPlaybackResult, MotionPlaybackStatus } from './models/motion-playback-result';
export type { MotionTargetReference } from './models/motion-target';
export type {
  MotionStepDefinition,
  MotionTimelineDefinition,
  MotionTrackDefinition
} from './models/motion-timeline';
export type { NormalizedMotionConfig } from './models/normalized-motion-config';
export type { ReducedMotionStrategy } from './models/reduced-motion-strategy';

export type {
  MotionDiagnostic,
  MotionDiagnosticLevel,
  MotionDiagnosticMetadata
} from './models/motion-diagnostic';

export type { MotionTriggerType } from './models/motion-trigger';
export { isMotionTriggerType, motionTriggerTypes } from './models/motion-trigger';

export type { MotionConflictStrategy } from './models/motion-conflict-strategy';

export {
  isMotionConflictStrategy,
  motionConflictStrategies
} from './models/motion-conflict-strategy';

export type {
  MotionPlaybackController,
  MotionPlaybackControllerStatus
} from './models/motion-playback-controller';

export { PromiseMotionPlaybackController } from './controllers/promise-motion-playback-controller';

export { validateMotionTimeline } from './validators/validate-motion-timeline';

export type { MotionValidationResult } from './models/motion-validation-result';

export { prepareMotionTimeline } from './compiler/prepare-motion-timeline';

export type {
  PreparedMotionStep,
  PreparedMotionTimeline,
  PreparedMotionTrack
} from './models/prepared-motion-timeline';

export { createMotionExecutionPlan } from './planner/create-motion-execution-plan';

export type { CreateMotionExecutionPlanInput } from './planner/create-motion-execution-plan';

export type { MotionExecutionPlan } from './models/motion-execution-plan';

export { scheduleMotionTimeline } from './scheduler/schedule-motion-timeline';

export type {
  ScheduledMotionTask,
  ScheduledMotionTimeline
} from './models/scheduled-motion-timeline';

export { createMotionExecutionPlanSummary } from './planner/create-motion-execution-plan-summary';

export type { CreateMotionExecutionPlanSummaryInput } from './planner/create-motion-execution-plan-summary';

export type { MotionExecutionPlanSummary } from './models/motion-execution-plan-summary';

export { MotionPlanningError } from './engine/motion-planning-error';

export const motionCoreVersion = '0.1.0';
