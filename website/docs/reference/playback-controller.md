---
sidebar_position: 7
---

# Playback controller

A playback controller controls a running animation.

Controllers are created through the engine.

## Creation APIs

The engine can create controllers for registered motions, direct timelines and compositions.

Main methods:

- createPlayback
- createTimelinePlayback
- createCompositionPlayback

## Common controls

Common controls include pause, resume, cancel, finish and dispose.

Controllers can also expose state reading and event subscription.

## Timeline navigation

When supported by the driver, a controller can seek by time, seek by progress and jump to labels.

## Playback direction and rate

When supported by the driver, a controller can play forward, play backward and update playback rate.

## Finished result

A controller exposes a finished promise that resolves to a playback result.

Use the finished result when you need the final animation outcome.
