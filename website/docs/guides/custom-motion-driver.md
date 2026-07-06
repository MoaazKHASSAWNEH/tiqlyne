---
sidebar_position: 12
---

# Custom motion driver

Drivers execute Tiqlyne timelines on a platform.

A custom driver can target a browser runtime, a native runtime, canvas, tests or another animation system.

## Role

A driver receives a `MotionTimelineDefinition` from the core package and adapts it to a concrete runtime.

## Required API

A driver must provide a name and a `play` method.

The `play` method receives:

- a target;
- a timeline;
- play options.

It returns a playback result.

## Optional APIs

A driver can also implement target-level operations:

- cancel;
- finish;
- reset.

A driver can also expose playback controller support.

## Responsibilities

A driver is responsible for target resolution, keyframe conversion, timing conversion, platform execution and result reporting.

## Boundary

A driver should not redefine the core animation model.

It should adapt Tiqlyne timelines to the target runtime.
