---
sidebar_position: 10
---

# Events reference

Engine hooks are supplied in `createMotionEngine({ events })`. Their exact types are `before-plan`, `plan`, `play`, `finish`, `cancel`, `skip`, and `error`; sources are `registered-motion` and `direct-timeline`.

Playback controllers expose `on` and `once` for `start`, `statusChange`, `pause`, `resume`, `cancel`, `finish`, `skip`, `fail`, `seek`, `progress`, `playbackRateChange`, and `directionChange`. `progress` is reserved in 0.1.0; the Web controller does not continuously emit it.

```ts
const stop = playback.on('statusChange', (event) => {
  console.log(event.playbackId, event.previousStatus, event.status, event.result);
});

playback.once('finish', (event) => console.log(event.timestamp));
stop();
```

Controller events contain `type`, `playbackId`, `status`, `previousStatus`, `timestamp`, and optional `state` and `result`.
