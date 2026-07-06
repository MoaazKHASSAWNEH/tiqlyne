---
sidebar_position: 11
---

# Reduced motion

The Web driver does not read media queries itself. Pass the current preference and opt in per playback (enabled by default after config normalization).

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver({ reducedMotion: prefersReducedMotion })
});

await motion.play(element, {
  id: 'panel-enter',
  type: 'slide-in',
  respectReducedMotion: true,
  reducedMotionStrategy: 'simplify'
});
```

| Strategy   | Web behavior when reduced motion applies                                                     |
| ---------- | -------------------------------------------------------------------------------------------- |
| `skip`     | Returns `skipped` with reason `reduced-motion`.                                              |
| `simplify` | Uses the definition's reduced timeline, or a generic opacity-only fallback capped at 150 ms. |
| `preserve` | Plays the original timeline.                                                                 |

In the basic pack, only `slide-in` supplies its own reduced timeline. The generic fallback emits a `reduced-motion-fallback-used` warning diagnostic. If `respectReducedMotion` is `false`, the preference and strategy do not change playback.

If preferences can change while the app is open, create/update driver wiring from a `matchMedia` change listener; 0.1.0 does not subscribe automatically.

## Common mistakes

- Assuming the driver calls `matchMedia` automatically.
- Using `preserve` while expecting movement to be simplified.
- Providing an invalid reduced timeline; it is validated independently.
- Forgetting that direct timelines need `options.reducedMotionTimeline` when a custom fallback is desired.

## Related pages

- [Reduced motion reference](../reference/reduced-motion.md)
- [Reduced motion example](../examples/reduced-motion.md)
- [Web driver](../reference/web-motion-driver.md)
