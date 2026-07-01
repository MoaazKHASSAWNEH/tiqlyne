export const MotionDiagnosticCodes = {
  PlaybackInvalidTransition: 'playback-invalid-transition',

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

  WebPlaybackSeekInvalidTime: 'web-playback-seek-invalid-time',
  WebPlaybackSeekFailed: 'web-playback-seek-failed',

  WebPlaybackSeekProgressInvalidProgress: 'web-playback-seek-progress-invalid-progress',
  WebPlaybackSeekProgressDurationUnavailable: 'web-playback-seek-progress-duration-unavailable',

  WebPlaybackJumpToLabelInvalidLabel: 'web-playback-jump-to-label-invalid-label',
  WebPlaybackJumpToLabelUnknownLabel: 'web-playback-jump-to-label-unknown-label',

  WebPlaybackSetPlaybackRateInvalidRate: 'web-playback-set-playback-rate-invalid-rate',
  WebPlaybackSetPlaybackRateFailed: 'web-playback-set-playback-rate-failed',

  WebPlaybackPlayForwardFailed: 'web-playback-play-forward-failed',
  WebPlaybackPlayBackwardFailed: 'web-playback-play-backward-failed',

  WebPlaybackPauseFailed: 'web-playback-pause-failed',
  WebPlaybackResumeFailed: 'web-playback-resume-failed',
  WebPlaybackCancelFailed: 'web-playback-cancel-failed',
  WebPlaybackFinishFailed: 'web-playback-finish-failed',
  WebPlaybackFinishNotSupportedForInfiniteAnimation:
    'web-playback-finish-not-supported-for-infinite-animation',

  WebDriverCancelFailed: 'web-driver-cancel-failed',
  WebDriverFinishFailed: 'web-driver-finish-failed',
  WebDriverResetFailed: 'web-driver-reset-failed',

  TimelineInspectionInfiniteTimeline: 'timeline-inspection-infinite-timeline',
  TimelineInspectionLongTimeline: 'timeline-inspection-long-timeline',
  TimelineInspectionEmptyStepKeyframes: 'timeline-inspection-empty-step-keyframes',
  TimelineInspectionLongStep: 'timeline-inspection-long-step'
} as const;

export type MotionDiagnosticCode =
  (typeof MotionDiagnosticCodes)[keyof typeof MotionDiagnosticCodes];
