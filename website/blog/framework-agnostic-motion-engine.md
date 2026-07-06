---
title: Designing a framework-agnostic motion engine
description: How symbolic targets and driver boundaries keep the core independent.
slug: framework-agnostic-motion-engine
---

Framework independence is less about supporting a long list of frameworks and more about choosing the right boundary.

The Tiqlyne core describes targets symbolically—`self`, `child`, `selector`, or `named`—and produces readonly timelines. It does not query the DOM or create browser animations. Those responsibilities belong to `MotionDriver<TTarget>`.

The official Web driver resolves symbolic targets and creates WAAPI animations. Tests can use deterministic no-op or test drivers. Future adapters can integrate through the same public contracts, but they are roadmap work rather than 0.1.0 features.

This separation also improves tooling: planning, validation, sampling, and inspection do not require a component lifecycle or rendering framework.
