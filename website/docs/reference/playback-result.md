---
sidebar_position: 14
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

A result describes one operation; it is not always the controller's lifecycle state. `running` is expected for infinite Web playback, while a seek can return `paused` when performed on paused playback. Use `controller.finished` for final completion.

## Engine and generic reasons

| Reason                                     | Meaning                                            |
| ------------------------------------------ | -------------------------------------------------- |
| `motion-disabled`                          | Config normalized to disabled.                     |
| `unknown-motion-type`                      | Registry has no matching definition.               |
| `motion-engine-error`                      | Unexpected engine failure.                         |
| `invalid-motion-options`                   | Definition option validation returned errors.      |
| `invalid-timeline`                         | Main timeline failed validation/planning.          |
| `invalid-reduced-motion-timeline`          | Reduced timeline failed validation/planning.       |
| `driver-cancel-not-supported`              | Driver has no target cancel method.                |
| `driver-finish-not-supported`              | Driver has no target finish method.                |
| `driver-reset-not-supported`               | Driver has no target reset method.                 |
| `playback-finished-promise-rejected`       | Fallback controller's completion promise rejected. |
| `playback-seek-invalid-time`               | Fallback received a non-finite time.               |
| `playback-seek-not-supported`              | Fallback cannot seek by time.                      |
| `playback-seek-progress-invalid-progress`  | Fallback received non-finite progress.             |
| `playback-seek-progress-not-supported`     | Fallback cannot seek by progress.                  |
| `playback-jump-to-label-invalid-label`     | Fallback received a blank label.                   |
| `playback-jump-to-label-not-supported`     | Fallback cannot seek to labels.                    |
| `playback-play-forward-not-supported`      | Fallback cannot change direction.                  |
| `playback-play-backward-not-supported`     | Fallback cannot change direction.                  |
| `playback-set-playback-rate-invalid-rate`  | Rate is non-finite or not positive.                |
| `playback-set-playback-rate-not-supported` | Fallback cannot change playback rate.              |
| `playback-pause-not-supported`             | Fallback cannot pause.                             |
| `playback-resume-not-supported`            | Fallback cannot resume.                            |
| `noop-driver`                              | No-op driver intentionally skipped the operation.  |
| `test-driver-cancel`                       | Deterministic test-driver cancel result.           |
| `test-driver-finish`                       | Deterministic test-driver finish result.           |
| `test-driver-reset`                        | Deterministic test-driver reset result.            |

## Web playback reasons

| Reason                                                     | Meaning                                        |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `web-playback-infinite`                                    | Animations started but have infinite duration. |
| `web-animation-error`                                      | WAAPI animation creation/execution failed.     |
| `web-playback-finished-promise-rejected`                   | Web completion promise rejected.               |
| `web-playback-seek`                                        | Absolute seek succeeded.                       |
| `web-playback-seek-invalid-time`                           | Seek time was non-finite.                      |
| `web-playback-seek-failed`                                 | WAAPI current-time update failed.              |
| `web-playback-seek-progress-invalid-progress`              | Progress was non-finite.                       |
| `web-playback-seek-progress-duration-unavailable`          | Duration is missing or infinite.               |
| `web-playback-jump-to-label-invalid-label`                 | Label was blank.                               |
| `web-playback-jump-to-label-unknown-label`                 | Timeline does not contain the label.           |
| `web-playback-set-playback-rate`                           | Positive rate update succeeded.                |
| `web-playback-set-playback-rate-invalid-rate`              | Rate was non-finite or not positive.           |
| `web-playback-set-playback-rate-failed`                    | WAAPI rate update failed.                      |
| `web-playback-play-forward`                                | Forward playback started.                      |
| `web-playback-play-backward`                               | Backward playback started.                     |
| `web-playback-play-forward-failed`                         | WAAPI forward operation failed.                |
| `web-playback-play-backward-failed`                        | WAAPI backward operation failed.               |
| `web-playback-pause`                                       | Pause succeeded.                               |
| `web-playback-pause-failed`                                | WAAPI pause failed.                            |
| `web-playback-resume`                                      | Resume succeeded.                              |
| `web-playback-resume-failed`                               | WAAPI resume failed.                           |
| `web-playback-cancel`                                      | Controller cancel succeeded.                   |
| `web-playback-cancel-failed`                               | Controller cancel failed.                      |
| `web-playback-finish`                                      | Controller finish succeeded.                   |
| `web-playback-finish-failed`                               | Controller finish failed.                      |
| `web-playback-finish-not-supported-for-infinite-animation` | Infinite effects cannot be finished.           |
| `web-driver-cancel`                                        | Target-level cancel succeeded.                 |
| `web-driver-cancel-failed`                                 | Target-level cancel failed.                    |
| `web-driver-finish`                                        | Target-level finish succeeded.                 |
| `web-driver-finish-failed`                                 | Target-level finish failed.                    |
| `web-driver-reset`                                         | Target-level cancel and style reset succeeded. |
| `web-driver-reset-failed`                                  | Target-level reset failed.                     |
| `reduced-motion`                                           | Reduced-motion `skip` policy applied.          |
| `target-not-found`                                         | At least one track resolved no elements.       |
| `motion-conflict-ignored`                                  | `ignore` policy found an active animation.     |

Use `MotionPlaybackResultReasons` instead of duplicating built-in literals. Custom drivers may return their own string reasons.

```ts
const result = await motion.play(element, { id: 'card', type: 'fade-in' });
if (result.status === 'skipped') console.info(result.reason);
if (result.status === 'failed') console.error(result.reason, result.error, result.diagnostics);
```

## Related pages

- [Diagnostics](./diagnostics.md)
- [Playback controller](./playback-controller.md)
- [Troubleshooting](../guides/troubleshooting.md)
