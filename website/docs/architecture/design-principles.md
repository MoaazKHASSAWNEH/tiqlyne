---
sidebar_position: 5
---

# Design principles

Tiqlyne separates motion authoring from runtime execution so each layer remains understandable and replaceable.

## Platform-independent core

`@tiqlyne/motion-core` models targets symbolically and never reads the DOM. Definitions return declarative timelines; they do not animate elements themselves.

## Driver-owned playback

The engine validates, prepares, plans, and schedules. A `MotionDriver<TTarget>` owns target resolution and runtime execution. The official Web driver translates the plan to Web Animations API objects.

## Inspectable before executable

Timelines are readonly data. Applications can validate, plan, inspect, or sample them before any platform side effect. This supports previews, tests, authoring tools, and diagnostics.

## Diagnostics-first failures

Expected playback problems are represented by statuses, reasons, and diagnostics. Exceptions remain appropriate for authoring/programming errors such as duplicate registry types or explicit planning failures.

## Accessibility is an execution concern

Configs carry reduced-motion policy, definitions may provide a reduced timeline, and drivers decide how that policy maps to a platform preference.

## Extensibility through contracts

New definitions, packs, drivers, and future framework adapters build on public contracts instead of changing the core model. Low-level planner and scheduler exports are available for advanced tooling, but high-level engine APIs are the preferred integration surface.

## Related pages

- [Package boundaries](./package-boundaries.md)
- [Execution pipeline](./execution-pipeline.md)
- [Version 0.1.0 boundaries](./v0-1-0-boundaries.md)
