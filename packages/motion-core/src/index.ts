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
export type {
  MotionPlaybackResult,
  MotionPlaybackStatus
} from './models/motion-playback-result';
export type { MotionTargetReference } from './models/motion-target';
export type {
  MotionStepDefinition,
  MotionTimelineDefinition,
  MotionTrackDefinition
} from './models/motion-timeline';
export type { NormalizedMotionConfig } from './models/normalized-motion-config';
export type { ReducedMotionStrategy } from './models/reduced-motion-strategy';

export const motionCoreVersion = '0.1.0';