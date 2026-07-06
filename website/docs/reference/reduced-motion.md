---
sidebar_position: 20
---

# Reduced motion reference

Registered configs and timeline play options normalize `respectReducedMotion` to `true` and `reducedMotionStrategy` to `skip` unless overridden.

| Strategy   | Result when Web driver `reducedMotion` is true                               |
| ---------- | ---------------------------------------------------------------------------- |
| `skip`     | Skip with reason `reduced-motion`.                                           |
| `simplify` | Use a definition-provided reduced timeline or generic opacity-only fallback. |
| `preserve` | Execute the normal timeline.                                                 |

A `MotionDefinition` may implement `buildReducedMotionTimeline(context)`. The engine plans and schedules that timeline alongside the primary timeline. The Web generic fallback removes movement and other properties, sets zero delay, `ease-out`, `fill: both`, and caps each step at 150 ms; it emits diagnostic `reduced-motion-fallback-used`.

```ts
const driver = new WebMotionDriver({
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
});
```

The driver option is a snapshot. Observe preference changes in application code if needed. `respectReducedMotion: false` bypasses reduced behavior. Only `slide-in` in the 0.1.0 basic pack supplies a custom reduced timeline.

## Related pages

- [Reduced-motion guide](../guides/reduced-motion.md)
- [Reduced-motion example](../examples/reduced-motion.md)
- [Web driver](./web-motion-driver.md)
