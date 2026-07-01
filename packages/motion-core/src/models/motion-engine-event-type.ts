export const MotionEngineEventTypes = {
  BeforePlan: 'before-plan',
  Plan: 'plan',
  Play: 'play',
  Finish: 'finish',
  Cancel: 'cancel',
  Skip: 'skip',
  Error: 'error'
} as const;

export type MotionEngineEventType =
  (typeof MotionEngineEventTypes)[keyof typeof MotionEngineEventTypes];

export const MotionEngineEventSources = {
  RegisteredMotion: 'registered-motion',
  DirectTimeline: 'direct-timeline'
} as const;

export type MotionEngineEventSource =
  (typeof MotionEngineEventSources)[keyof typeof MotionEngineEventSources];
