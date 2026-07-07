---
title: Why Tiqlyne Motion Engine exists
description: Why typed, inspectable motion deserves its own platform-independent layer.
slug: why-tiqlyne-motion-engine-exists
date: 2026-07-07
tags: [motion, architecture, product]
---

Animation code rarely begins as infrastructure. It begins with a product detail: fade in a panel, slide a notification into view, or coordinate a few elements during navigation. A direct call against one element is often the right first move. The difficulty appears later, when that isolated effect becomes part of an application-wide motion language.

## The problem

As an interface grows, motion has to answer more questions. Which easing and duration are standard? Can the same effect run on several targets? What happens when options come from configuration rather than source code? How should the animation change for someone who prefers reduced motion? What can a test assert without opening a browser?

Ad-hoc animation code tends to mix those answers together. Element lookup, option defaults, keyframes, sequencing, accessibility policy, and runtime calls end up in a component or event handler. Two effects that look similar then drift apart. A timing change requires edits in several places, and invalid input is discovered only when playback reaches the browser.

The problem is not that direct animation APIs are bad. The Web Animations API is a capable runtime. The problem is that a runtime API alone does not provide an application with a reusable, inspectable motion model.

## Why reusable definitions matter

Tiqlyne treats a motion such as `fade-in` or `slide-in` as a definition with a stable type, metadata, options, and a function that builds a symbolic timeline. Application code can request that definition by type while the definition remains the canonical home for its behavior.

That separation makes a motion easier to share and review. Design decisions live in one place instead of being copied between screens. The initial basic pack is intentionally small—exactly `fade-in`, `fade-out`, and `slide-in`—because the goal of 0.1.0 is to establish the model, not to claim a comprehensive preset catalogue.

## Why typed options matter

Reusable definitions need configurable behavior, but unstructured option bags move mistakes to runtime. Tiqlyne option schemas connect TypeScript inference, defaults, normalization, metadata, and validation. A definition receives normalized values, and application teams get a clearer contract for what can vary.

Types are not a substitute for runtime checks. Configuration can arrive from JSON, a CMS, or future tooling. Normalization and validation remain part of the engine pipeline so unknown input does not silently become broken keyframes.

## Why timeline validation matters

A timeline combines targets, tracks, steps, keyframes, labels, timing, and defaults. Small inconsistencies in that structure can produce surprisingly difficult playback bugs. Tiqlyne validates the symbolic timeline before delegating to a driver and reports structured diagnostics when planning cannot continue.

This boundary is useful for both humans and runtimes. Authors get errors closer to the source of the problem; drivers receive prepared input with fewer ambiguous cases. Planning can also happen synchronously without playing anything, which is valuable in tests and authoring tools.

## Why inspection and sampling matter

Motion is temporal, so source code alone does not always reveal what happens at a particular instant. Inspection summarizes timeline structure and duration. Sampling evaluates timeline state at a time or progress value. Neither API starts playback.

Those capabilities help application teams build deterministic tests, previews, debugging views, and internal authoring experiences. They also create a foundation for future tooling without implying that a visual builder ships today. In 0.1.0, Tiqlyne provides the data and analysis primitives; any richer interface remains later work.

## How this helps application teams

The practical benefit is a clearer division of responsibility:

- product code asks for a semantic motion or supplies a deliberate timeline;
- definitions own reusable behavior and typed variation;
- the engine normalizes, validates, plans, and applies policy;
- a driver resolves symbolic targets and executes on a platform;
- results and diagnostics make outcomes observable.

This does not remove the need for motion design judgment. It gives that judgment a maintainable place to live. Teams can use high-level registered motions for common behavior, direct timelines for precise cases, and compositions when several registered motions form a sequence.

## Current 0.1.0 scope

Version 0.1.0 provides the platform-independent core, the official Web Animations API driver, and the basic motion pack. The public model covers registered definitions, direct timelines, compositions, planning, validation, diagnostics, playback controllers, events, sampling, inspection, reduced-motion strategies, and conflict strategies.

The release is deliberately narrow. Pre-1.0 APIs can still evolve, and lower-level planning or conversion helpers deserve more caution than the high-level engine and builder APIs. The [API stability policy](/docs/release/api-stability) explains those expectations.

## What Tiqlyne does not promise yet

Tiqlyne 0.1.0 does not ship official framework adapters, a visual editor, additional production drivers, or a broad library of presets. It also does not make every platform behavior identical: the core describes motion, while a driver owns runtime-specific target resolution and playback.

Those boundaries are intentional. Possible future work belongs in the roadmap until it is implemented, tested, and released. The existence of a driver contract makes other adapters possible; it does not make them available today.

## Where to start next

Read [What is Tiqlyne Motion Engine?](/docs/intro) for the product model, then follow [Getting started](/docs/getting-started) for a first browser animation. The [learning path](/docs/start/learning-path) routes deeper tasks, while the [architecture overview](/docs/architecture/overview) explains how the packages and runtime boundary fit together.
