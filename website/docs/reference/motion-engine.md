---
sidebar_position: 1
---

# Motion engine reference

`MotionEngine<TTarget>` is the high-level registry, planning, playback, and controller API. `TTarget` must match the configured driver (`Element` for Web).

## Choose a method

| Need | Start with |
| --- | --- |
| Play one registered semantic motion | `play` |
| Play a hand-authored timeline | `playTimeline` |
| Combine registered motions | `playComposition` |
| Validate and inspect work without playback | `plan`, `planTimeline`, or `planComposition` |
| Pause, seek, reverse, or observe playback | A `create*Playback` method |

All `play*` and target-operation methods are asynchronous. Planning methods are synchronous and throw `MotionPlanningError` for invalid input.

```ts
const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver(),
  defaults: { duration: 300, easing: 'ease-out', fill: 'both' },
  validation,
  events
});
```

The driver is required. Registry and normalizer default to `DefaultMotionRegistry` and `DefaultMotionConfigNormalizer`.

## Registry methods

| Signature                                                                                          | Return / behavior                                                                                      | Use                          |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `register<TOptions extends object>(definition: MotionDefinition<TOptions>): MotionEngine<TTarget>` | Registers through the configured registry; duplicate default-registry types throw. Returns the engine. | Add one reusable definition. |
| `registerMany(definitions: ReadonlyArray<MotionDefinition<object>>): MotionEngine<TTarget>`        | Registers in order and returns the engine. A duplicate can leave earlier items registered.             | Add a known collection.      |
| `has(type: string): boolean`                                                                       | Delegates to registry.                                                                                 | Guard optional configs.      |
| `get(type: string): MotionDefinition<object> \| undefined`                                         | Delegates to registry.                                                                                 | Inspect one definition.      |
| `getAll(): ReadonlyArray<MotionDefinition<object>>`                                                | Registry snapshot.                                                                                     | Build tooling/catalogues.    |
| `getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>`                 | Exact category filter.                                                                                 | Group definitions.           |

```ts
motion.register(new FadeInMotion());
motion.registerMany([new FadeOutMotion(), new SlideInMotion()]);
console.log(motion.getByCategory('entrance'));
```

## Playback methods

```ts
play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;
playTimeline(
  target: TTarget,
  timeline: MotionTimelineDefinition,
  options?: MotionTimelinePlayOptions
): Promise<MotionPlaybackResult>;
playComposition(
  target: TTarget,
  composition: MotionCompositionDefinition,
  options?: MotionTimelinePlayOptions
): Promise<MotionPlaybackResult>;
```

`play` normalizes the config, skips disabled/unknown motions, validates definition options and timelines, creates an execution plan, and delegates to the driver. Expected planning errors become failed results (`invalid-motion-options`, `invalid-timeline`, or `invalid-reduced-motion-timeline`); unexpected errors become `motion-engine-error`.

`playTimeline` skips definition lookup and accepts direct play options. `playComposition` compiles against the engine registry, then follows timeline playback. Use registered playback for semantic reusable motions, direct timelines for low-level control, and compositions for combined items.

```ts
const registered = await motion.play(element, { id: 'hero', type: 'fade-in' });
const direct = await motion.playTimeline(element, timeline);
const combined = await motion.playComposition(element, composition);
```

## Planning methods

```ts
plan(config: MotionConfig): MotionExecutionPlan;
planTimeline(
  timeline: MotionTimelineDefinition,
  options?: MotionTimelinePlayOptions
): MotionExecutionPlan;
planComposition(
  composition: MotionCompositionDefinition,
  options?: MotionTimelinePlayOptions
): MotionExecutionPlan;
```

Planning is synchronous and does not call the driver. Unlike `play`, invalid input throws `MotionPlanningError`. The error contains a machine-readable code, diagnostics, and validation errors. Use planning for previews, build-time checks, debugging, and advanced tooling.

```ts
try {
  const plan = motion.plan({ id: 'preview', type: 'slide-in' });
  console.log(plan.summary);
} catch (error) {
  console.error(error);
}
```

## Controller creation

```ts
createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController;
createTimelinePlayback(
  target: TTarget,
  timeline: MotionTimelineDefinition,
  options?: MotionTimelinePlayOptions
): MotionPlaybackController;
createCompositionPlayback(
  target: TTarget,
  composition: MotionCompositionDefinition,
  options?: MotionTimelinePlayOptions
): MotionPlaybackController;
```

The engine uses the driver's native controller when available. Disabled/unknown/invalid input or missing driver support falls back to `PromiseMotionPlaybackController`; its `finished`, cancel, and finish paths work, while advanced controls report unsupported results.

```ts
const playback = motion.createPlayback(element, { id: 'interactive', type: 'slide-in' });
const pauseResult = await playback.pause();
const finalResult = await playback.finished;
```

## Target operations

```ts
cancel(target: TTarget): Promise<MotionPlaybackResult>;
finish(target: TTarget): Promise<MotionPlaybackResult>;
reset(target: TTarget): Promise<MotionPlaybackResult>;
```

These delegate to optional driver methods. Missing capabilities return skipped reasons `driver-cancel-not-supported`, `driver-finish-not-supported`, or `driver-reset-not-supported`. Web implementations can additionally return their operation-specific success/failure reasons.

```ts
await motion.cancel(element);
await motion.finish(element);
await motion.reset(element);
```

## Common mistakes

- Omitting required `id` from `MotionConfig`.
- Using `plan*` without handling thrown `MotionPlanningError`.
- Assuming controller creation throws; it intentionally falls back.
- Using a target type that does not match the driver.

## Related pages

- [Engine setup](../guides/engine-setup.md)
- [Motion registry](./motion-registry.md)
- [Playback controllers](./playback-controller.md)
- [Playback results](./playback-result.md)
