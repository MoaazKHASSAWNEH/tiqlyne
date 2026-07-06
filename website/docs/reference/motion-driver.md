---
sidebar_position: 6
---

# Motion driver

A motion driver executes timelines on a platform.

The core package defines the driver contract. Platform packages implement it.

## Official Web driver

The official browser driver is `WebMotionDriver` from `@tiqlyne/motion-web`.

## Driver role

A driver receives a target, a timeline and play options.

It adapts the platform-independent timeline model to a concrete runtime and returns a playback result.

## Optional capabilities

A driver can support target-level operations such as cancel, finish and reset.

A driver can also expose playback controller support.

## Boundaries

A driver should not redefine the core motion model.

It should execute timelines produced by the core.
