---
sidebar_position: 17
---

# Events reference

Engine events observe high-level planning/playback. Controller events observe one playback instance.

## Engine events

Pass callbacks in `MotionEngineConfig.events`.

| Type constant / value        | Callback       | Specific payload                                         |
| ---------------------------- | -------------- | -------------------------------------------------------- |
| `BeforePlan` / `before-plan` | `onBeforePlan` | Optional original `config` or `timeline`                 |
| `Plan` / `plan`              | `onPlan`       | `plan`                                                   |
| `Play` / `play`              | `onPlay`       | Required `target`, `plan`                                |
| `Finish` / `finish`          | `onFinish`     | Required `target`, `result`                              |
| `Cancel` / `cancel`          | `onCancel`     | `target`, `result`, `timestamp`                          |
| `Skip` / `skip`              | `onSkip`       | `reason`, `result`; target/source/motion fields optional |
| `Error` / `error`            | `onError`      | `error`                                                  |

Most engine events also contain `source`, `timestamp`, and optional `target`, `motionId`, and `motionType`. Sources are `registered-motion` and `direct-timeline`. Cancel events have no `source`; composition activity uses `direct-timeline`.

```ts
const motion = createMotionEngine<Element>({
  driver,
  events: {
    onPlan: ({ source, plan }) => console.log(source, plan.summary),
    onSkip: ({ reason }) => console.warn(reason),
    onError: ({ error }) => console.error(error)
  }
});
```

Hooks are synchronous and observational. Do not mutate readonly event data or rely on callbacks to change playback.

## Playback events

Values in `MotionPlaybackEventTypes` are `start`, `statusChange`, `pause`, `resume`, `cancel`, `finish`, `skip`, `fail`, `seek`, `progress`, `playbackRateChange`, and `directionChange`.

```ts
type MotionPlaybackEvent = {
  readonly type: MotionPlaybackEventType;
  readonly playbackId: string;
  readonly state?: MotionPlaybackState;
  readonly status: MotionPlaybackControllerStatus;
  readonly previousStatus: MotionPlaybackControllerStatus;
  readonly timestamp: number;
  readonly result?: MotionPlaybackResult;
};
```

`on(type, listener)` subscribes until its returned function or `dispose()` removes it. `once` removes itself after the first matching event. `dispose()` clears listeners but does not cancel animations.

```ts
const unsubscribe = playback.on('seek', ({ state, result }) => {
  console.log(state?.currentTime, result?.reason);
});
playback.once('finish', ({ result }) => console.log(result));
unsubscribe();
```

The Web controller emits seek, direction, and playback-rate events for those operations. `progress` is reserved in 0.1.0 and is not continuously emitted.

## Related pages

- [Events guide](../guides/events.md)
- [Playback controller](./playback-controller.md)
- [Motion engine](./motion-engine.md)
