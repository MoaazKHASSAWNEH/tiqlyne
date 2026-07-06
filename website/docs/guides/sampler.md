---
sidebar_position: 8
---

# Timeline sampler

The timeline sampler reads timeline values at specific time points.

It is useful for previews, tests, visual editors, debugging and timeline analysis.

## Sample a timeline

```ts
import { sampleMotionTimeline } from '@tiqlyne/motion-core';

const samples = sampleMotionTimeline(timeline, {
  interval: 100
});

console.log(samples);
```

## Sample at a specific time

```ts
import { sampleMotionTimelineAt } from '@tiqlyne/motion-core';

const sample = sampleMotionTimelineAt(timeline, 250);

console.log(sample);
```

## What sampling is for

Sampling is useful when you need to preview timeline values, test generated timelines, inspect keyframes, build timeline visualizers or debug timing.

## Sampler vs playback

The sampler does not execute animations on a platform. It analyzes timeline data.

Use a platform driver, such as `WebMotionDriver`, for real playback.
