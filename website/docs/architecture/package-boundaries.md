---
sidebar_position: 2
---

# Package boundaries

Tiqlyne Motion Engine is organized as a small ecosystem of focused packages.

```mermaid
flowchart TB
  App[Application] --> Core[@tiqlyne/motion-core]
  App --> Web[@tiqlyne/motion-web]
  App --> Pack[@tiqlyne/motion-pack-basic]
  Pack --> Core
  Web --> Core
  Web --> Browser[Browser / Web Animations API]
```

## Boundary rule

The most important rule is simple:

```txt
Core describes and prepares motion.
Drivers execute motion.
Packs provide reusable motion definitions.
```

This keeps the engine testable, extensible and framework-agnostic.

## @tiqlyne/motion-core

`@tiqlyne/motion-core` is platform-independent.

It owns:

- public engine contracts;
- registry APIs;
- motion definitions;
- option schemas and validators;
- timeline models and builders;
- composition authoring and compilation;
- validation;
- preparation and planning;
- scheduling;
- diagnostics;
- playback contracts;
- sampler;
- inspector;
- noop and test drivers.

It must not import or depend on:

- DOM APIs;
- Web Animations API;
- React;
- Angular;
- Vue;
- Svelte;
- GSAP;
- CSS runtime execution.

## @tiqlyne/motion-web

`@tiqlyne/motion-web` is the official browser platform adapter.

It owns:

- `WebMotionDriver`;
- DOM target resolution;
- Web keyframe conversion;
- Web timing conversion;
- Web Animations API playback;
- Web playback controller;
- reduced motion handling at browser execution level;
- animation conflict handling.

It depends on `@tiqlyne/motion-core` because it receives core timelines and execution options.

## @tiqlyne/motion-pack-basic

`@tiqlyne/motion-pack-basic` provides official ready-to-use definitions.

The current version includes:

- `fade-in`
- `fade-out`
- `slide-in`

The pack depends on `@tiqlyne/motion-core` because every motion definition builds a core timeline.

## Examples

Examples are not public packages.

`examples/vanilla` demonstrates how to use the official packages together in a browser without a framework.

## Why package boundaries matter

Clear boundaries allow Tiqlyne to grow safely:

- new drivers can be added without changing core;
- new packs can be added without changing drivers;
- framework adapters can be built later on top of the same contracts;
- documentation and tests can target each layer independently.
