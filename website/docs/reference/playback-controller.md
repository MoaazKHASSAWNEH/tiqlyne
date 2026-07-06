---
sidebar_position: 13
---

# Playback controller

`MotionPlaybackController` exposes runtime state and controls for one playback.

```ts
interface MotionPlaybackController {
  readonly id: string;
  readonly status: MotionPlaybackControllerStatus;
  readonly disposed: boolean;
  readonly finished: Promise<MotionPlaybackResult>;
  getState(): MotionPlaybackState;
  seek(time: number): Promise<MotionPlaybackResult>;
  seekProgress(progress: number): Promise<MotionPlaybackResult>;
  jumpToLabel(label: string): Promise<MotionPlaybackResult>;
  playForward(): Promise<MotionPlaybackResult>;
  playBackward(): Promise<MotionPlaybackResult>;
  setPlaybackRate(rate: number): Promise<MotionPlaybackResult>;
  pause(): Promise<MotionPlaybackResult>;
  resume(): Promise<MotionPlaybackResult>;
  cancel(): Promise<MotionPlaybackResult>;
  finish(): Promise<MotionPlaybackResult>;
  on(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;
  once(type: MotionPlaybackEventType, listener: MotionPlaybackEventListener): () => void;
  dispose(): void;
}
```

Statuses are `idle`, `running`, `paused`, `finished`, `cancelled`, `failed`, and `skipped`.

## State

`getState()` returns status, nullable current time/duration/progress, playback rate, `forward` or `backward` direction, active track/step indexes, and optional current label. Web values are read from WAAPI; fallback values for time/duration/progress are `null`.

## Controls and results

| Method                        | Behavior                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `seek(time)`                  | Absolute milliseconds; Web requires a finite value and clamps to at least zero. |
| `seekProgress(progress)`      | Web clamps finite progress to `0..1`; unavailable/infinite duration is skipped. |
| `jumpToLabel(label)`          | Seeks to an exact timeline label; blank/unknown labels are skipped.             |
| `playForward`, `playBackward` | Set WAAPI direction through playback-rate sign and play.                        |
| `setPlaybackRate(rate)`       | Requires a finite rate greater than zero.                                       |
| `pause`, `resume`             | Require a valid non-terminal transition.                                        |
| `cancel`                      | Cancels underlying animations and reaches `cancelled` on success.               |
| `finish`                      | Finishes finite animations; skipped for infinite playback.                      |

Every control is async and returns a result. Invalid transitions normally return `skipped` plus `playback-invalid-transition` diagnostics rather than throwing.

## Native and fallback controllers

The Web driver supplies `WebMotionPlaybackController` and supports the full contract subject to browser/animation state. If a driver omits `createPlayback`, the engine returns `PromiseMotionPlaybackController`: `finished`, cancel, and finish delegate to engine paths, while seek, direction, rate, pause, and resume are unsupported/skipped.

```ts
const playback = motion.createTimelinePlayback(element, timeline);
const stop = playback.on('statusChange', (event) => console.log(event.status));

await playback.pause();
await playback.seekProgress(0.5);
await playback.resume();
const finalResult = await playback.finished;

stop();
playback.dispose();
```

Disposal only removes event subscriptions; cancel explicitly if the animation should stop.

## Related pages

- [Controller guide](../guides/playback-controllers.md)
- [Controller example](../examples/playback-controller.md)
- [Events](./events.md)
- [Playback results](./playback-result.md)
