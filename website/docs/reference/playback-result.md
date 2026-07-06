---
sidebar_position: 8
---

# Playback result

```ts
type MotionPlaybackResult = {
  readonly status: 'finished' | 'cancelled' | 'skipped' | 'failed' | 'paused' | 'running';
  readonly reason?: MotionPlaybackResultReason | string;
  readonly error?: unknown;
  readonly diagnostics?: ReadonlyArray<MotionDiagnostic>;
};
```

A result describes one operation; it is not always the controller's final lifecycle state. Use `controller.finished` for the terminal playback result.

## Built-in reasons

Engine/planning: `motion-disabled`, `unknown-motion-type`, `motion-engine-error`, `invalid-motion-options`, `invalid-timeline`, `invalid-reduced-motion-timeline`.

Driver fallback: `driver-cancel-not-supported`, `driver-finish-not-supported`, `driver-reset-not-supported`, `noop-driver`, `test-driver-cancel`, `test-driver-finish`, `test-driver-reset`.

Generic controller: `playback-finished-promise-rejected`, `playback-seek-invalid-time`, `playback-seek-not-supported`, `playback-seek-progress-invalid-progress`, `playback-seek-progress-not-supported`, `playback-jump-to-label-invalid-label`, `playback-jump-to-label-not-supported`, `playback-play-forward-not-supported`, `playback-play-backward-not-supported`, `playback-set-playback-rate-invalid-rate`, `playback-set-playback-rate-not-supported`, `playback-pause-not-supported`, `playback-resume-not-supported`.

Web playback: `web-playback-infinite`, `web-animation-error`, `web-playback-finished-promise-rejected`, `web-playback-seek`, `web-playback-seek-invalid-time`, `web-playback-seek-failed`, `web-playback-seek-progress-invalid-progress`, `web-playback-seek-progress-duration-unavailable`, `web-playback-jump-to-label-invalid-label`, `web-playback-jump-to-label-unknown-label`, `web-playback-set-playback-rate`, `web-playback-set-playback-rate-invalid-rate`, `web-playback-set-playback-rate-failed`, `web-playback-play-forward`, `web-playback-play-backward`, `web-playback-play-forward-failed`, `web-playback-play-backward-failed`, `web-playback-pause`, `web-playback-pause-failed`, `web-playback-resume`, `web-playback-resume-failed`, `web-playback-cancel`, `web-playback-cancel-failed`, `web-playback-finish`, `web-playback-finish-failed`, `web-playback-finish-not-supported-for-infinite-animation`.

Web target operations: `web-driver-cancel`, `web-driver-cancel-failed`, `web-driver-finish`, `web-driver-finish-failed`, `web-driver-reset`, `web-driver-reset-failed`.

Web policy: `reduced-motion`, `target-not-found`, `motion-conflict-ignored`.

Use `MotionPlaybackResultReasons` for stable literals. Custom drivers may return other strings.
