---
title: Designing a framework-agnostic motion engine
description: How symbolic targets and driver boundaries keep the core independent.
slug: framework-agnostic-motion-engine
date: 2026-07-07
tags: [architecture, drivers, framework-agnostic]
---

## Why framework-agnostic matters

Framework independence is less about claiming support for every framework and more about choosing a stable boundary. Motion definitions should remain reusable when an application's rendering layer changes.

## Core versus driver

The core describes targets symbolically—`self`, `child`, `selector`, or `named`—and produces readonly timelines. It does not query the DOM or create animations. Those responsibilities belong to `MotionDriver<TTarget>`.

This makes planning, validation, sampling, inspection, and deterministic tests independent of component lifecycles.

## The Web driver today

Version 0.1.0 includes `WebMotionDriver`, which resolves symbolic targets and creates Web Animations API animations. It also owns Web conflict policy, reduced-motion execution, and controller behavior.

## Future adapters later

The driver contract makes other runtimes possible, but no other official production driver ships in 0.1.0. Future adapters remain roadmap work.

Read the [architecture overview](/docs/architecture/overview), [motion definition reference](/docs/reference/motion-definition), and [driver reference](/docs/reference/motion-driver) for the current contracts.
