# Playback Seek API

> Status: current public API guide.
> Scope: `MotionPlaybackController.seek(time)`.
> Introduced after: `2ac08b1 feat(core): add playback seek control`.

## 1. Purpose

`seek(time)` moves a playback controller to a specific time in milliseconds.

It is the first real timeline control after pause, resume, cancel and finish.

It prepares the next V1 controls:

```txt
seekProgress(progress)
jumpToLabel(label)
reverse / playBackward
setPlaybackRate(rate)
advanced playback events
```

## 2. Main API

Every `MotionPlaybackController` now exposes:

```ts
seek(time: number): Promise<MotionPlaybackResult>;
```

Example:

```ts
const playback = motion.createTimelinePlayback(element, timeline);

await playback.seek(500);

const state = playback.getState();
```

## 3. Time unit

`time` is expressed in milliseconds.

Example:

```txt
seek(0)    -> move to timeline start
seek(500)  -> move to 500ms
seek(1200) -> move to 1200ms
```

## 4. Generic promise controller behavior

`PromiseMotionPlaybackController` does not know how to control a concrete runtime clock.

Therefore, seek is intentionally unsupported there.

It returns:

```txt
status: skipped
reason: playback-seek-not-supported
```

Invalid seek time returns:

```txt
status: skipped
reason: playback-seek-invalid-time
```

This follows the engine rule:

```txt
Controlled unsupported operations return skipped, not failed.
```

## 5. Web playback controller behavior

`WebMotionPlaybackController` supports `seek(time)` by setting `Animation.currentTime` on every managed Web Animation.

A successful seek:

```txt
keeps the current controller status
keeps paused playback paused
keeps running playback running
sets Animation.currentTime for each animation
returns a MotionPlaybackResult
```

A seek does not currently emit a dedicated `seek` event.

Dedicated seek/progress events are planned for the advanced playback events phase.

## 6. Terminal states

Seeking is not allowed from terminal states.

Terminal states include:

```txt
finished
cancelled
failed
skipped
```

In those cases, the controller returns a skipped invalid transition result.

## 7. Invalid time

Invalid values such as `NaN`, `Infinity` or `-Infinity` are rejected.

Expected result:

```txt
status: skipped
reason: web-playback-seek-invalid-time
```

for Web playback, or:

```txt
status: skipped
reason: playback-seek-invalid-time
```

for generic promise playback.

## 8. Current limitations

Current limitations are intentional for the first implementation.

```txt
No seekProgress(progress) yet.
No jumpToLabel(label) yet.
No dedicated onSeek event yet.
No sampler-backed activeTrackIndexes update yet.
No sampler-backed activeStepIndexes update yet.
No currentLabel update yet.
```

## 9. Recommended next step

The next V1 feature after `seek(time)` is:

```txt
seekProgress(progress)
```

Then:

```txt
jumpToLabel(label)
reverse / playBackward
setPlaybackRate(rate)
advanced playback events
```
