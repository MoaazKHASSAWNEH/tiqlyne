---
sidebar_position: 10
---

# Reduced motion

Tiqlyne can adapt animations for users who prefer reduced motion.

The browser preference can be connected to `WebMotionDriver` through its `reducedMotion` option.

When playing a motion, the engine can receive `respectReducedMotion` and a strategy.

Available strategies are:

- `skip`
- `simplify`
- `preserve`

A reusable motion definition can also provide a dedicated simplified timeline.

In the current basic pack, `slide-in` includes simplified behavior for reduced motion.

Use this feature for large movements, rotations, repeated animations and fast transitions.
