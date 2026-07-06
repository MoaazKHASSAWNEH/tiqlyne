---
sidebar_position: 19
---

# Inspector reference

`inspectMotionTimeline(timeline)` prepares a timeline and returns structural metadata for debugging, documentation, tests, and authoring tools.

```ts
const inspection = inspectMotionTimeline(timeline);
console.table(inspection.tracks.flatMap((track) => track.steps));
```

`MotionTimelineInspection` contains `totalDuration`, track/step/label counts, sorted labels, unique targets, unique animated properties, detailed tracks, and diagnostics. Each step reports indexes, start/end time, duration, delay, active duration, iterations, properties, keyframe count, and `infinite`.

There is no `hasInfinitePlayback` field. Check `totalDuration === Infinity`, a step's `infinite`, or diagnostic `timeline-inspection-infinite-timeline`.

Inspector diagnostics are informational recommendations: infinite playback, timelines longer than 3000 ms, steps longer than 1500 ms, and empty keyframe arrays. They do not replace `validateMotionTimeline`.

## Related pages

- [Inspector guide](../guides/inspector.md)
- [Sampler reference](./sampler.md)
- [Diagnostics](./diagnostics.md)
