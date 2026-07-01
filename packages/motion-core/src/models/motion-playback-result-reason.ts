/**
 * Stable playback result reasons emitted by the core and web packages.
 *
 * A result reason explains why a playback operation returned a given status.
 * It is intentionally separate from diagnostics: a reason summarizes the outcome,
 * while diagnostics provide additional structured details.
 */
export const MotionPlaybackResultReasons = {
  MotionDisabled: 'motion-disabled',
  UnknownMotionType: 'unknown-motion-type',
  MotionEngineError: 'motion-engine-error',

  InvalidMotionOptions: 'invalid-motion-options',
  InvalidTimeline: 'invalid-timeline',
  InvalidReducedMotionTimeline: 'invalid-reduced-motion-timeline',

  DriverCancelNotSupported: 'driver-cancel-not-supported',
  DriverFinishNotSupported: 'driver-finish-not-supported',
  DriverResetNotSupported: 'driver-reset-not-supported',

  PlaybackFinishedPromiseRejected: 'playback-finished-promise-rejected',

  PlaybackSeekInvalidTime: 'playback-seek-invalid-time',
  PlaybackSeekNotSupported: 'playback-seek-not-supported',

  PlaybackSeekProgressInvalidProgress: 'playback-seek-progress-invalid-progress',
  PlaybackSeekProgressNotSupported: 'playback-seek-progress-not-supported',

  PlaybackJumpToLabelInvalidLabel: 'playback-jump-to-label-invalid-label',
  PlaybackJumpToLabelNotSupported: 'playback-jump-to-label-not-supported',

  PlaybackPlayForwardNotSupported: 'playback-play-forward-not-supported',
  PlaybackPlayBackwardNotSupported: 'playback-play-backward-not-supported',

  PlaybackSetPlaybackRateInvalidRate: 'playback-set-playback-rate-invalid-rate',
  PlaybackSetPlaybackRateNotSupported: 'playback-set-playback-rate-not-supported',

  PlaybackPauseNotSupported: 'playback-pause-not-supported',
  PlaybackResumeNotSupported: 'playback-resume-not-supported',

  NoopDriver: 'noop-driver',

  TestDriverCancel: 'test-driver-cancel',
  TestDriverFinish: 'test-driver-finish',
  TestDriverReset: 'test-driver-reset',

  WebPlaybackInfinite: 'web-playback-infinite',
  WebAnimationError: 'web-animation-error',

  WebPlaybackFinishedPromiseRejected: 'web-playback-finished-promise-rejected',

  WebPlaybackSeek: 'web-playback-seek',
  WebPlaybackSeekInvalidTime: 'web-playback-seek-invalid-time',
  WebPlaybackSeekFailed: 'web-playback-seek-failed',

  WebPlaybackSeekProgressInvalidProgress: 'web-playback-seek-progress-invalid-progress',
  WebPlaybackSeekProgressDurationUnavailable: 'web-playback-seek-progress-duration-unavailable',

  WebPlaybackJumpToLabelInvalidLabel: 'web-playback-jump-to-label-invalid-label',
  WebPlaybackJumpToLabelUnknownLabel: 'web-playback-jump-to-label-unknown-label',

  WebPlaybackSetPlaybackRate: 'web-playback-set-playback-rate',
  WebPlaybackSetPlaybackRateInvalidRate: 'web-playback-set-playback-rate-invalid-rate',
  WebPlaybackSetPlaybackRateFailed: 'web-playback-set-playback-rate-failed',

  WebPlaybackPlayForward: 'web-playback-play-forward',
  WebPlaybackPlayBackward: 'web-playback-play-backward',
  WebPlaybackPlayForwardFailed: 'web-playback-play-forward-failed',
  WebPlaybackPlayBackwardFailed: 'web-playback-play-backward-failed',

  WebPlaybackPause: 'web-playback-pause',
  WebPlaybackPauseFailed: 'web-playback-pause-failed',

  WebPlaybackResume: 'web-playback-resume',
  WebPlaybackResumeFailed: 'web-playback-resume-failed',

  WebPlaybackCancel: 'web-playback-cancel',
  WebPlaybackCancelFailed: 'web-playback-cancel-failed',

  WebPlaybackFinish: 'web-playback-finish',
  WebPlaybackFinishFailed: 'web-playback-finish-failed',
  WebPlaybackFinishNotSupportedForInfiniteAnimation:
    'web-playback-finish-not-supported-for-infinite-animation',

  WebDriverCancel: 'web-driver-cancel',
  WebDriverCancelFailed: 'web-driver-cancel-failed',
  WebDriverFinish: 'web-driver-finish',
  WebDriverFinishFailed: 'web-driver-finish-failed',
  WebDriverReset: 'web-driver-reset',
  WebDriverResetFailed: 'web-driver-reset-failed',

  ReducedMotion: 'reduced-motion',
  TargetNotFound: 'target-not-found',
  MotionConflictIgnored: 'motion-conflict-ignored'
} as const;

/**
 * Built-in playback result reason value.
 *
 * Custom drivers, plugins and applications may still return custom string reasons
 * where needed.
 */
export type MotionPlaybackResultReason =
  (typeof MotionPlaybackResultReasons)[keyof typeof MotionPlaybackResultReasons];
