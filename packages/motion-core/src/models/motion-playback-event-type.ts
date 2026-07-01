export const MotionPlaybackEventTypes = {
  Start: 'start',
  StatusChange: 'statusChange',
  Pause: 'pause',
  Resume: 'resume',
  Cancel: 'cancel',
  Finish: 'finish',
  Skip: 'skip',
  Fail: 'fail',
  Seek: 'seek',
  Progress: 'progress',
  PlaybackRateChange: 'playbackRateChange',
  DirectionChange: 'directionChange'
} as const;

export type MotionPlaybackEventType =
  (typeof MotionPlaybackEventTypes)[keyof typeof MotionPlaybackEventTypes];
