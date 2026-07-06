---
sidebar_position: 1
---

# Engine reference

The engine is the main entry point of Tiqlyne Motion Engine.

It is created with `createMotionEngine` from `@tiqlyne/motion-core`.

## Main responsibilities

The engine can register reusable definitions, prepare animation plans, run timelines with a driver and create playback controllers.

## Registry APIs

The registry-related APIs are used to add and read reusable motion definitions.

Main methods:

- register
- registerMany
- has
- get
- getAll
- getByCategory

## Playback APIs

Playback APIs execute a motion request through the configured driver.

Main methods:

- play
- playTimeline
- playComposition

## Planning APIs

Planning APIs prepare animation information without executing it.

Main methods:

- plan
- planTimeline
- planComposition

## Controller APIs

Controller APIs create playback controllers for interactive control.

Main methods:

- createPlayback
- createTimelinePlayback
- createCompositionPlayback

## Target operations

The engine can delegate target operations to the active driver.

Main methods:

- cancel
- finish
- reset

## Driver requirement

A driver is required for real platform playback.

The core package can still be used without a platform driver for planning, validation, inspection and tests.
