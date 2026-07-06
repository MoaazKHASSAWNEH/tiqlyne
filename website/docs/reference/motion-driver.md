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

The required signature is `play(target, timeline, options): Promise<MotionPlaybackResult>`. Optional methods are async `cancel`, `finish`, and `reset`, plus synchronous `createPlayback(target, timeline, options): MotionPlaybackController`.

`MotionPlayOptions` contains required `trigger`, `respectReducedMotion`, `reducedMotionStrategy`, and `conflictStrategy`, plus optional reduced timeline, execution plan, and timeline-validation flags. The engine supplies these normalized values.

## Boundaries

A driver should not redefine the core motion model.

It should execute timelines produced by the core.
