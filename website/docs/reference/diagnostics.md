---
sidebar_position: 9
---

# Diagnostics reference

```ts
type MotionDiagnostic = {
  readonly level: 'info' | 'warning' | 'error';
  readonly code: string;
  readonly message: string;
  readonly source?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
};
```

Built-in sources are `motion-timeline-validator`, `timeline-inspector`, `promise-motion-playback-controller`, `web-motion-playback-controller`, `web-motion-driver`, `motion-composition-compiler`, and `motion-option-validator`.

## Built-in codes

Controller input and support:

- `playback-invalid-transition`
- `playback-seek-invalid-time`, `playback-seek-not-supported`
- `playback-seek-progress-invalid-progress`, `playback-seek-progress-not-supported`
- `playback-jump-to-label-invalid-label`, `playback-jump-to-label-not-supported`
- `playback-play-forward-not-supported`, `playback-play-backward-not-supported`
- `playback-set-playback-rate-invalid-rate`, `playback-set-playback-rate-not-supported`

Web controller and driver:

- `web-playback-seek-invalid-time`, `web-playback-seek-failed`
- `web-playback-seek-progress-invalid-progress`, `web-playback-seek-progress-duration-unavailable`
- `web-playback-jump-to-label-invalid-label`, `web-playback-jump-to-label-unknown-label`
- `web-playback-set-playback-rate-invalid-rate`, `web-playback-set-playback-rate-failed`
- `web-playback-play-forward-failed`, `web-playback-play-backward-failed`
- `web-playback-pause-failed`, `web-playback-resume-failed`, `web-playback-cancel-failed`
- `web-playback-finish-failed`, `web-playback-finish-not-supported-for-infinite-animation`
- `web-driver-cancel-failed`, `web-driver-finish-failed`, `web-driver-reset-failed`

Inspector:

- `timeline-inspection-infinite-timeline`
- `timeline-inspection-long-timeline`
- `timeline-inspection-empty-step-keyframes`
- `timeline-inspection-long-step`

Use `MotionDiagnosticCodes` and `MotionDiagnosticSources` instead of duplicating literals. The creation helpers are `createMotionDiagnostic`, `createMotionInfoDiagnostic`, `createMotionWarningDiagnostic`, and `createMotionErrorDiagnostic`; playback-specific helpers create invalid-input, invalid-transition, unsupported, and operation-failed diagnostics.

Validation may also use descriptive string codes beyond `MotionDiagnosticCodes`. Consumers must therefore handle unknown future/custom strings.
