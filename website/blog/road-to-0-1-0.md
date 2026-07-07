---
title: The road to 0.1.0
description: What the first Tiqlyne Motion Engine release establishes—and what it leaves for later.
slug: road-to-0-1-0
date: 2026-07-07
tags: [release, roadmap, versioning]
---

A first public version has two competing temptations: expose every promising idea, or hide the project until every edge is polished. Tiqlyne 0.1.0 takes a narrower route. It publishes a coherent motion model that can be tried in real applications while marking the parts that still need pre-1.0 feedback.

## Why 0.1.0 is intentionally narrow

The core question for this release is whether reusable definitions, symbolic timelines, execution planning, and platform drivers form a useful boundary. A large preset catalogue or several shallow integrations would not answer that question more clearly. They would increase the surface area before the foundation had been exercised.

The release therefore focuses on one platform-independent core, one official production driver, and one small basic pack. The shape is deliberate: describe motion in core, execute it through a driver, and share behavior through definitions.

## What is stable enough to try

Version 0.1.0 supports three main authoring paths:

- registered motion configs for reusable semantic behavior;
- direct timelines for explicit tracks, steps, targets, labels, and keyframes;
- compositions that combine registered definitions and compile to a timeline.

Around those paths, the engine provides option normalization, validation, planning, scheduling, diagnostics, events, playback results, controllers, reduced-motion policy, conflict strategy, inspection, and sampling. The Web driver turns symbolic targets and prepared timelines into Web Animations API playback.

“Stable enough to try” is not the same as a 1.0 compatibility promise. The [API stability policy](/docs/release/api-stability) distinguishes the recommended high-level surface from lower-level helpers that may evolve more readily.

## Current package scope

The release aligns three public package roots:

- `@tiqlyne/motion-core` contains the framework- and platform-independent model and engine;
- `@tiqlyne/motion-web` contains the official browser driver and Web runtime utilities;
- `@tiqlyne/motion-pack-basic` contains exactly `fade-in`, `fade-out`, and `slide-in`.

Public examples import only from those roots. Internal source paths are implementation details and are not supported application entry points. The [public exports reference](/docs/reference/public-exports) is the canonical inventory.

## What is intentionally limited

There is no official framework adapter, visual builder, additional production driver, or broad preset collection in 0.1.0. The Web driver does not automatically monitor `matchMedia`; applications provide the current reduced-motion boolean. Browser reset behavior is also concrete rather than abstract: the Web driver cancels tracked animations and removes the root target's `style` attribute.

These limitations are documented so teams can evaluate the release honestly. They are not disguised commitments for the next version. A possible feature remains unavailable until code, tests, documentation, and a release say otherwise.

## What the documentation covers

The site is organized by reader intent rather than by package folders alone:

- Docs explains the product and gets a new user running;
- Tutorials teach workflows step by step;
- Guides discuss practical decisions in depth;
- Examples provide copy-paste application cases;
- API Reference records exact contracts and behavior;
- Blog gives context and design reasoning;
- Project holds architecture, release, and repository-maintainer material.

That separation matters in a pre-1.0 project. A beginner should not need internal build commands to animate an element, while a maintainer needs more than a simplified quick start to publish safely.

## Why high-level APIs are preferred

The engine and builders preserve the intended mental model even when internal planning details change. `createMotionEngine`, registered playback, timeline builders, and composition builders express application intent and let Tiqlyne coordinate validation and policy.

Lower-level planner, scheduler, conversion, and validation utilities are public where they enable advanced tooling, but consumers should adopt them deliberately. Composing many internal stages by hand creates more coupling to pre-1.0 implementation details. Start at the highest level that fits the job, then move lower only when the additional control is necessary.

## Feedback needed before later versions

The most valuable feedback is grounded in integration work:

- Are definitions and option schemas clear enough for an application motion library?
- Do symbolic targets cover practical Web structures without hiding too much lookup behavior?
- Are planning failures and diagnostics actionable?
- Do controller results make interactive playback states predictable?
- Are reduced-motion and conflict policies explicit enough at application boundaries?
- Which low-level APIs are genuinely needed by tooling rather than merely interesting to expose?

Answers to those questions can refine contracts before 1.0 with less disruption than guessing from a hypothetical feature list.

## Reading roadmap and limitations correctly

The [limitations page](/docs/release/limitations) describes what the current version does not do. The [roadmap](/docs/release/roadmap) describes possible directions, not shipped behavior and not a delivery schedule. The [release status](/docs/release/status) is the place to check what is current.

No roadmap item should be used as an API contract. Applications should depend only on documented public exports and behavior in an available version.

## Growing without breaking the mental model

Future versions can add definitions, drivers, tooling, or integration layers while retaining the same conceptual flow: application intent becomes a symbolic motion model, the engine validates and plans it, and a driver executes it. Growth is healthiest when new capability fits one of those responsibilities instead of blurring package boundaries.

That is the purpose of a narrow 0.1.0: not to freeze every signature, but to make the central model concrete enough to test. For compatibility expectations and release semantics, continue with [versioning](/docs/release/versioning) and [API stability](/docs/release/api-stability).
