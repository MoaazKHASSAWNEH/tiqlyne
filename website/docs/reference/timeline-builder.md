---
sidebar_position: 7
---

# Timeline builder

`createMotionTimeline(callback)` is the preferred fluent API for producing a `MotionTimelineDefinition`. `createMotionTimelineBuilder()` returns the builder for manual/chained construction.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 300, easing: 'ease-out', fill: 'both' });
  timeline.label('details', 300);

  timeline.track('self', (track) => {
    track.defaults({ duration: 200 });
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
    track.step({ at: { anchor: 'previous-end', offset: 50 } }, (step) => {
      step.keyframes([{ transform: { scale: 0.96 } }, { transform: { scale: 1 } }]);
    });
  });

  timeline.track({ type: 'selector', selector: '.item' }, (track) => {
    track.stagger({ each: 40, from: 'start' });
    track.step({ at: 0 }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });

  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ at: 'details' }, (step) => step.to({ opacity: 1 }));
  });
});
```

## Builder methods

| Builder                 | Methods                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `MotionTimelineBuilder` | `defaults`, `label`, `track`, `build`                                       |
| `MotionTrackBuilder`    | `defaults`, `stagger`, `step(callback)`, `step(options, callback)`, `build` |
| `MotionStepBuilder`     | `keyframe`, `keyframes`, `from`, `to`, `build`                              |

`from` forces `offset: 0`; `to` forces `offset: 1`. `track('self', ...)` is shorthand for `{ type: 'self' }`. Tracks share the same timeline and therefore run in parallel unless their step positions differ. Steps without `at` follow normal track sequencing.

Common mistakes: creating an empty step, referencing a missing label, placing `fill` on `MotionConfig` instead of timeline defaults, and expecting `step.keyframes` to add offsets automatically.

## Related pages

- [Direct timelines guide](../guides/direct-timelines.md)
- [Multiple tracks and steps](../guides/multiple-tracks-and-steps.md)
- [Timeline model](./motion-timeline.md)
