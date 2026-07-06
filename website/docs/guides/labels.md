---
sidebar_position: 6
---

# Timeline labels

Labels map names to absolute milliseconds. They position steps and let Web playback controllers seek to meaningful points.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.label('start', 0);
  timeline.label('details', 300);

  timeline.track('self', (track) => {
    track.step({ at: 'start', duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
    track.step({ at: { label: 'details', offset: 50 }, duration: 200 }, (step) => {
      step.from({ transform: { y: 8 } });
      step.to({ transform: { y: 0 } });
    });
  });
});

const playback = motion.createTimelinePlayback(element, timeline);
const result = await playback.jumpToLabel('details');
```

Label names must be non-empty, label times must be finite and non-negative, and step references must name an existing label. An unknown controller label returns a skipped result with reason `web-playback-jump-to-label-unknown-label`.

## Related pages

- [Timeline builder](../reference/timeline-builder.md)
- [Playback controllers](./playback-controllers.md)
- [Compositions](./compositions.md)
