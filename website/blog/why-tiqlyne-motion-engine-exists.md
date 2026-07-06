---
title: Why Tiqlyne Motion Engine exists
description: Why typed, inspectable motion deserves its own platform-independent layer.
slug: why-tiqlyne-motion-engine-exists
date: 2026-07-07
tags: [motion, architecture, product]
---

## The problem

Animation code often begins as a small call tied directly to an element. As an application grows, that call becomes harder to reuse, validate, test, inspect, or adapt to accessibility preferences.

## The approach

Tiqlyne separates core data and planning, platform execution, and reusable definitions. A timeline can be validated and inspected without a browser; a driver translates it to a runtime; a pack provides shared motion vocabulary.

## What exists in 0.1.0

The current scope includes typed timelines, registered definitions, compositions, controllers, diagnostics, sampling, inspection, a Web Animations API driver, and `fade-in`, `fade-out`, and `slide-in`.

## What does not exist yet

Version 0.1.0 does not include official framework adapters, a visual editor, additional production drivers, or a large animation catalogue.

## What comes next

The immediate priority is to validate the public foundation through real usage and evolve it carefully before 1.0. Planned work remains documented in the project roadmap rather than presented as shipped functionality.

Start with [What is Tiqlyne Motion Engine?](/docs/intro), then follow the [learning path](/docs/start/learning-path) for practical documentation.
