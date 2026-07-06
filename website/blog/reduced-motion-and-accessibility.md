---
title: Reduced motion and accessible animation
description: Reduced motion as a policy shared by configs, definitions, and drivers.
slug: reduced-motion-and-accessibility
date: 2026-07-07
---

## Why reduced motion matters

Motion should support comprehension without causing avoidable discomfort. Reduced motion is not one universal replacement: applications need policy, definitions may know a suitable alternative, and runtimes must know the platform preference.

## What the engine supports today

A config chooses `skip`, `simplify`, or `preserve`. A definition may provide `buildReducedMotionTimeline`. The basic `slide-in` definition supplies a short opacity-only alternative, while the Web driver can produce a generic simplification.

## What the Web driver does not observe automatically

`WebMotionDriver` receives a `reducedMotion` boolean snapshot. It does not call or subscribe to `matchMedia`; applications that support live preference changes must update their engine/driver wiring.

## Best practices

Use motion to reinforce hierarchy, keep alternatives short and calm, preserve semantic HTML, and never make animation the only way information is conveyed. Test all three policies with real interface states.
