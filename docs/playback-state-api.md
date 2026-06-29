# Playback State API

> Status: current public API guide.
> Scope: `@structifyx/motion-core` playback state model and controller state API.
> Introduced after: `4a7161d feat(core): add playback state model`.

## 1. Purpose

Playback state gives every playback controller a common way to describe its current runtime state.

It answers questions such as:

```txt
Is the playback running, paused, finished, cancelled, failed or skipped?
What is the current time?
What is the total duration?
What is the current progress?
What is the playback direction?
What is the playback rate?
```

This is the foundation for future V1 controls such as:

```txt
seek(time)
seekProgress(progress)
jumpToLabel(label)
reverse / playBackward
setPlaybackRate(rate)
advanced playback events
```

## 2. Main API

Every `MotionPlaybackController` now exposes:

```ts
getState(): MotionPlaybackState;
```

Typical usage:

```ts
const playback = motion.createTimelinePlayback(element, timeline);

const state = playback.getState();

console.log(state.status);
console.log(state.currentTime);
console.log(state.progress);
```

## 3. State model

```ts
export type MotionPlaybackDirectionState = 'forward' | 'backward';

export type MotionPlaybackState = {
  readonly status: MotionPlaybackControllerStatus;
  readonly currentTime: number | null;
  readonly duration: number | null;
  readonly progress: number | null;
  readonly playbackRate: number;
  readonly direction: MotionPlaybackDirectionState;
  readonly activeTrackIndexes: ReadonlyArray<number>;
  readonly activeStepIndexes: ReadonlyArray<number>;
  readonly currentLabel?: string;
};
```

## 4. Why some fields are nullable

`currentTime`, `duration` and `progress` may be `null`.

This is intentional.

Some controllers are generic and do not know the underlying runtime timing information.

For example, `PromiseMotionPlaybackController` wraps a promise and control handlers. It can expose its status, but it does not know the real animation current time.

Therefore it returns:

```txt
currentTime: null
duration: null
progress: null
```

This avoids fake timing values.

## 5. Generic promise controller behavior

`PromiseMotionPlaybackController` returns a platform-neutral state.

Default running state:

```ts
{
  status: 'running',
  currentTime: null,
  duration: null,
  progress: null,
  playbackRate: 1,
  direction: 'forward',
  activeTrackIndexes: [],
  activeStepIndexes: []
}
```

The status updates after terminal operations such as `cancel()` and `finish()`.

## 6. Web playback controller behavior

`WebMotionPlaybackController` derives its state from Web Animation objects when possible.

It can expose:

```txt
currentTime from Animation.currentTime
duration from effect.getComputedTiming().endTime
progress from currentTime / duration
playbackRate from Animation.playbackRate
direction from playbackRate sign
```

If timing information is unavailable, fields may still be `null`.

## 7. Active tracks and active steps

The state model already includes:

```txt
activeTrackIndexes
activeStepIndexes
currentLabel
```

In the first playback state implementation, these are not yet fully connected to timeline sampling.

They are reserved for the next phases:

```txt
seek(time)
seekProgress(progress)
timeline sampler integration
advanced playback events
inspector/devtools support
```

## 8. Relationship with Timeline Sampler

Timeline Sampler computes timeline state without playing anything.

Playback State describes a live controller state.

Together they prepare the next feature:

```txt
seek(time)
```

The future direction is:

```txt
controller currentTime
  -> sampleMotionTimelineAtTime(timeline, currentTime)
  -> active tracks / active steps / current keyframe state
```

## 9. Current limitations

Current limitations are intentional.

```txt
No seek(time) yet.
No seekProgress(progress) yet.
No jumpToLabel(label) yet.
No reverse/playBackward controller method yet.
No setPlaybackRate(rate) controller method yet.
No onProgress/onSeek event yet.
No full sampler integration in WebMotionPlaybackController yet.
```

## 10. Recommended next step

The next V1 feature after Playback State is:

```txt
seek(time)
```

Then:

```txt
seekProgress(progress)
jumpToLabel(label)
reverse/playBackward
setPlaybackRate(rate)
```
