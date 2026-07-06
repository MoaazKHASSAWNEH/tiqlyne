# Timeline Sampler API

> Status: current public API guide.
> Scope: `@tiqlyne/motion-core` timeline sampling API.
> Audience: developers who need to inspect a timeline state without playing it.

## 1. Purpose

The Timeline Sampler lets the core answer this question:

```txt
What should this timeline look like at a specific time or progress?
```

It does not use DOM, Web Animations API, Canvas, React Native or any platform driver.

It is pure `motion-core` logic.

## 2. Main APIs

```ts
sampleMotionTimeline(timeline, input): MotionTimelineSample
sampleMotionTimelineAtTime(timeline, time): MotionTimelineSample
sampleMotionTimelineAtProgress(timeline, progress): MotionTimelineSample
```

The API is exported from `@tiqlyne/motion-core`.

## 3. Why it matters

Timeline sampling is the base for advanced V1 playback features.

It enables:

```txt
seek(time)
seekProgress(progress)
jumpToLabel(label)
playback state
preview sliders
timeline snapshots
builder preview
future inspectors
future devtools
```

Without sampling, seek and preview must be implemented separately in every driver.

With sampling, the core can calculate the timeline state once in a platform-neutral way.

## 4. Basic usage

```ts
import { sampleMotionTimelineAtTime } from '@tiqlyne/motion-core';

const sample = sampleMotionTimelineAtTime(timeline, 350);
```

Example result shape:

```ts
{
  time: 350,
  progress: 0.35,
  duration: 1000,
  tracks: [],
  activeSteps: [],
  completedSteps: [],
  pendingSteps: []
}
```

## 5. Sampling by time

```ts
const sample = sampleMotionTimelineAtTime(timeline, 500);
```

Behavior:

```txt
negative time is clamped to 0
finite timeline time is clamped to total duration
infinite timeline time is clamped to at least 0
```

## 6. Sampling by progress

```ts
const sample = sampleMotionTimelineAtProgress(timeline, 0.5);
```

Behavior:

```txt
progress is clamped between 0 and 1
progress is converted to time using timeline total duration
```

Progress sampling is not supported for infinite timelines because an infinite timeline has no finite duration.

Error code:

```txt
timeline-sample-infinite-progress-unsupported
```

## 7. Generic input API

```ts
const sampleA = sampleMotionTimeline(timeline, {
  time: 250
});

const sampleB = sampleMotionTimeline(timeline, {
  progress: 0.25
});
```

The input accepts either `time` or `progress`, not both.

## 8. Output model

```ts
export type MotionTimelineSample = {
  readonly time: number;
  readonly progress: number;
  readonly duration: number;
  readonly tracks: ReadonlyArray<MotionTimelineTrackSample>;
  readonly activeSteps: ReadonlyArray<MotionTimelineStepSample>;
  readonly completedSteps: ReadonlyArray<MotionTimelineStepSample>;
  readonly pendingSteps: ReadonlyArray<MotionTimelineStepSample>;
};
```

Each track sample contains:

```ts
export type MotionTimelineTrackSample = {
  readonly trackIndex: number;
  readonly target: MotionTargetReference;
  readonly steps: ReadonlyArray<MotionTimelineStepSample>;
};
```

Each step sample contains:

```ts
export type MotionTimelineStepSample = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly status: 'pending' | 'active' | 'completed';
  readonly startTime: number;
  readonly endTime: number;
  readonly localTime: number;
  readonly progress: number;
  readonly keyframe: MotionKeyframe;
};
```

## 9. Step statuses

The sampler classifies each prepared step.

```txt
pending
  sample time is before the step start time

active
  sample time is inside the step active interval

completed
  sample time is after the step end time
```

For infinite steps, the step remains active after it starts.

## 10. Preparation behavior

The sampler uses the existing timeline preparation pipeline.

That means it benefits from:

```txt
timeline defaults
track defaults
step defaults
labels
anchors
previous-start / previous-end positions
iterations
endDelay
activeDuration
```

The sampler should not duplicate label or anchor resolution logic.

## 11. Interpolation behavior

Current interpolated properties:

```txt
opacity
custom numeric properties
```

Current discrete fallback properties:

```txt
transform
filter
backgroundColor
color
borderColor
boxShadow
outlineColor
custom string properties
```

Discrete fallback means:

```txt
before the end of the segment, keep the previous value
at the end of the segment, use the next value
```

Advanced transform/color interpolation is intentionally not part of the first sampler implementation.

## 12. Direction and yoyo behavior

The sampler supports:

```txt
direction: normal
direction: reverse
direction: alternate
direction: alternate-reverse
yoyo: true
finite iterations
infinite iterations
```

`yoyo: true` is sampled as alternate direction behavior.

## 13. Errors

Invalid finite time throws:

```txt
timeline-sample-invalid-time
```

Invalid progress throws:

```txt
timeline-sample-invalid-progress
```

Progress sampling on infinite timelines throws:

```txt
timeline-sample-infinite-progress-unsupported
```

## 14. Current test coverage

The initial sampler test suite covers:

```txt
sampling opacity by time
sampling opacity by progress
pending / active / completed step status
labels through preparation
custom numeric properties
reverse direction
yoyo sampling
progress sampling rejection for infinite timelines
generic sampleMotionTimeline() time input
```

## 15. Current limitations

Current limitations are intentional for the first implementation.

```txt
No advanced transform interpolation yet.
No color interpolation yet.
No easing curve sampling yet.
No filter interpolation yet.
No timeline snapshot restore API yet.
No playback controller integration yet.
```

These limitations should be handled in future V1 phases only when needed by seek, playback state or inspector work.

## 16. Recommended next step

The next V1 feature after Timeline Sampler is:

```txt
MotionPlaybackState
```

Then:

```txt
seek(time)
seekProgress(progress)
jumpToLabel(label)
```
