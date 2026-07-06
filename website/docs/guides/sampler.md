---
sidebar_position: 10
---

# Timeline sampler

The sampler prepares a timeline and returns its state at one absolute time or progress ratio. It does not play anything.

```ts
import {
  sampleMotionTimeline,
  sampleMotionTimelineAtProgress,
  sampleMotionTimelineAtTime
} from '@tiqlyne/motion-core';

const at250ms = sampleMotionTimelineAtTime(timeline, 250);
const halfway = sampleMotionTimelineAtProgress(timeline, 0.5);
const sameSample = sampleMotionTimeline(timeline, { time: 250 });
```

`MotionTimelineSampleInput` is exactly `{ time: number } | { progress: number }`; there is no interval option.

## Returned snapshot

The sample contains `time`, `progress`, `duration`, `tracks`, and flattened `activeSteps`, `completedSteps`, and `pendingSteps` arrays. Each step sample reports its indexes, status, absolute bounds, local time, progress, and sampled keyframe.

Times and progress values are clamped. Non-finite inputs throw `MotionPlanningError`. Progress sampling is unsupported for infinite timelines; sample those with an absolute time instead.

The sampler interpolates numeric opacity and numeric custom properties. Other values, including transforms, are resolved discretely rather than fully interpolated, so it is intended for inspection and tests—not as a rendering engine.

## Related pages

- [Sampler reference](../reference/sampler.md)
- [Inspector](./inspector.md)
- [Direct timelines](./direct-timelines.md)
