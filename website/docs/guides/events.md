---
sidebar_position: 6
---

# Events

Tiqlyne exposes playback events through playback controllers.

Events help applications observe animation lifecycle changes and keep interface state synchronized with animation state.

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
