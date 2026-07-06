---
sidebar_position: 18
---

# Sampler reference

The sampler creates a deterministic snapshot without running a driver.

```ts
sampleMotionTimeline(timeline, { time: 250 });
sampleMotionTimeline(timeline, { progress: 0.5 });
sampleMotionTimelineAtTime(timeline, 250);
sampleMotionTimelineAtProgress(timeline, 0.5);
```

`MotionTimelineSampleInput` is exactly `{ time: number; progress?: never } | { time?: never; progress: number }`.

`MotionTimelineSample` reports `time`, `progress`, `duration`, per-track samples, and flattened `activeSteps`, `completedSteps`, and `pendingSteps`. Step status is `pending`, `active`, or `completed`; each sample includes track/step indexes, start/end/local time, progress, and one sampled keyframe.

Finite time and progress are clamped. Non-finite inputs throw `MotionPlanningError` with `timeline-sample-invalid-time` or `timeline-sample-invalid-progress`. Infinite timelines support time sampling but reject progress sampling with `timeline-sample-infinite-progress-unsupported`.

Opacity and numeric `custom` properties are interpolated. Transforms, filters, colors, shadows, and other values are discrete. Easing curves are not applied by the sampler. It is suitable for previews, assertions, debugging, and visual tooling, but not runtime rendering.

## Related pages

- [Sampler guide](../guides/sampler.md)
- [Inspector reference](./inspector.md)
- [Direct timeline example](../examples/direct-timeline.md)
