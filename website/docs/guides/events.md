---
sidebar_position: 6
---

# Events

Tiqlyne exposes synchronous engine hooks and playback-controller events.

Events help applications observe animation lifecycle changes and keep interface state synchronized with animation state.

## Engine events

```ts
const motion = createMotionEngine<Element>({
  driver,
  events: {
    onBeforePlan: (event) => console.log(event.type),
    onPlan: (event) => console.log(event.plan.summary),
    onPlay: (event) => console.log(event.source),
    onFinish: (event) => console.log(event.result),
    onCancel: (event) => console.log(event.result),
    onSkip: (event) => console.log(event.reason),
    onError: (event) => console.error(event.error)
  }
});
```

The stable engine type values are `before-plan`, `plan`, `play`, `finish`, `cancel`, `skip`, and `error`.

## Playback events

Common playback events include:

- `start`
- `statusChange`
- `pause`
- `resume`
- `cancel`
- `finish`
- `skip`
- `fail`
- `seek`
- `progress`
- `playbackRateChange`
- `directionChange`

`progress` is reserved by the contract; the 0.1.0 Web controller does not emit continuous progress notifications.

## Listen to an event

```ts
const unsubscribe = playback.on('finish', (event) => {
  console.log(event.type);
  console.log(event.status);
});
```

The `on` method returns an unsubscribe function.

```ts
unsubscribe();
```

## Listen once

```ts
playback.once('cancel', (event) => {
  console.log(event);
});
```

## Final result

For the final outcome, prefer the `finished` promise.

```ts
const result = await playback.finished;

console.log(result.status);
```

## Best practices

Use events for UI synchronization, logs and debugging.

Use playback results when you need the final animation outcome.

## Common mistakes

- Treating engine callbacks as middleware that can change a plan.
- Subscribing after a very short playback has already emitted its first event.
- Assuming `progress` is a continuous timer in the Web controller.
- Calling `dispose()` and expecting the animation to cancel.

## Related pages

- [Events reference](../reference/events.md)
- [Playback controllers](./playback-controllers.md)
- [Playback results](../reference/playback-result.md)
