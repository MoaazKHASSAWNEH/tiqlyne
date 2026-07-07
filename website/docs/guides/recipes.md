---
sidebar_position: 16
---

# Recipes

These snippets assume a configured browser `motion` engine, an `element` root, and the basic pack where registered types are used.

:::tip How to use this page

Pick the recipe closest to your task, then follow its link for the full contract and edge cases. These fragments are reminders, not a replacement for engine setup or the focused copy-paste [Examples](../examples/index.md).

:::

## Registered motions

```ts
await motion.play(element, { id: 'fade', type: 'fade-in' });
await motion.play(element, {
  id: 'slide',
  type: 'slide-in',
  options: { direction: 'left', distance: 32, fade: true }
});
```

Use these for standard entrance/exit behavior. See [basic motions](./basic-motions.md).

## Child and selector targets

```ts
const targets = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 240, easing: 'ease-out', fill: 'both' });

  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step((step) => step.to({ opacity: 1 }));
  });
  timeline.track({ type: 'selector', selector: '.item' }, (track) => {
    track.stagger(50);
    track.step((step) => step.to({ opacity: 1 }));
  });
});
await motion.playTimeline(element, targets);
```

The child resolves once; the selector animates every match. See [motion targets](../reference/motion-targets.md).

## Parallel tracks and sequenced steps

```ts
const sequence = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 200 }, (step) => step.to({ opacity: 1 }));
    track.step({ at: { anchor: 'previous-end', offset: 40 }, duration: 200 }, (step) =>
      step.to({ transform: { scale: 1 } })
    );
  });
  timeline.track({ type: 'child', name: 'badge' }, (track) => {
    track.step({ at: 0, duration: 200 }, (step) => step.to({ opacity: 1 }));
  });
});
```

Tracks overlap; the second self step follows its predecessor. See [timeline builder](../reference/timeline-builder.md).

## Labels and preview controls

```ts
const playback = motion.createTimelinePlayback(element, labelledTimeline);
await playback.jumpToLabel('details');
await playback.pause();
await playback.seekProgress(0.5);
await playback.resume();
const result = await playback.finished;
playback.dispose();
```

Check every operation result in production UI. See [playback controllers](./playback-controllers.md).

## Reusable composition

```ts
const pageEntrance = createMotionComposition((composition) => {
  composition.motion('fade-in', { defaults: { duration: 180 } });
  composition.motion('slide-in', {
    at: 120,
    options: { direction: 'bottom', distance: 24, fade: false }
  });
});
await motion.playComposition(element, pageEntrance);
```

See [composition builder](../reference/composition-builder.md).

## Reduced motion and diagnostics

```ts
const result = await motion.play(element, {
  id: 'accessible-enter',
  type: 'slide-in',
  reducedMotionStrategy: 'simplify'
});
for (const diagnostic of result.diagnostics ?? []) console.warn(diagnostic);
```

See [reduced motion](./reduced-motion.md) and [diagnostics](./diagnostics.md).

## Inspect and sample

```ts
const report = inspectMotionTimeline(timeline);
const preview = sampleMotionTimelineAtProgress(timeline, 0.5);
console.log(report.totalDuration, preview.activeSteps);
```

These APIs do not play the timeline. See [inspector](../reference/inspector.md) and [sampler](../reference/sampler.md).

## Extend the engine

```ts
registry.register(new RiseInMotion());
const canvasMotion = createMotionEngine<HTMLCanvasElement>({
  driver: new CanvasMotionDriver()
});
```

Definitions create reusable declarative motion; drivers adapt it to another runtime. See [custom definitions](./custom-motion-definition.md) and [custom drivers](./custom-motion-driver.md) for complete implementations.
