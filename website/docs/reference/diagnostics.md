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

| Source                               | Producer                                |
| ------------------------------------ | --------------------------------------- |
| `motion-timeline-validator`          | Core timeline validation                |
| `timeline-inspector`                 | Inspection recommendations              |
| `promise-motion-playback-controller` | Fallback controller                     |
| `web-motion-playback-controller`     | WAAPI controller operations             |
| `web-motion-driver`                  | Browser execution and target operations |
| `motion-composition-compiler`        | Composition resolution/compilation      |
| `motion-option-validator`            | Registered definition option validation |

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

The code name describes the specific condition: `invalid-*` is bad input, `not-supported` is a capability gap, `*-failed` is a runtime operation failure, and `timeline-inspection-*` is advisory inspection output.

Use `MotionDiagnosticCodes` and `MotionDiagnosticSources` instead of duplicating literals. The creation helpers are `createMotionDiagnostic`, `createMotionInfoDiagnostic`, `createMotionWarningDiagnostic`, and `createMotionErrorDiagnostic`; playback-specific helpers create invalid-input, invalid-transition, unsupported, and operation-failed diagnostics.

```ts
const diagnostic = createMotionWarningDiagnostic(
  'app-motion-budget',
  'Animation exceeds the application motion budget.',
  'app-tooling',
  { duration: 1800 }
);
```

`createMotionDiagnostic` accepts `{ level, code, message, source?, metadata? }`. Level helpers take `(code, message, source?, metadata?)`. Playback invalid-input/unsupported/operation helpers take `(code, message, source, metadata?)`; invalid-transition takes `(action, currentStatus, source)`.

A result **reason** summarizes an operation outcome. Diagnostics explain one or more details and carry severity/source/metadata. Do not assume every failed or skipped result contains diagnostics.

Validation may also use descriptive string codes beyond `MotionDiagnosticCodes`. Consumers must therefore handle unknown future/custom strings.

## Related pages

- [Diagnostics guide](../guides/diagnostics.md)
- [Diagnostics example](../examples/diagnostics.md)
- [Playback results](./playback-result.md)
