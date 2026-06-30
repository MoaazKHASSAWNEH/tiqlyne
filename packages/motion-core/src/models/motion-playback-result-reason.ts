export const MotionPlaybackResultReasons = {
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
    'web-playback-finish-not-supported-for-infinite-animation'
} as const;

export type MotionPlaybackResultReason =
  (typeof MotionPlaybackResultReasons)[keyof typeof MotionPlaybackResultReasons];
