---
title: Why Tiqlyne Motion Engine exists
description: Why typed, inspectable motion deserves its own platform-independent layer.
slug: why-tiqlyne-motion-engine-exists
---

Animation code often begins as a small call tied directly to an element. As an application grows, that call becomes harder to reuse, validate, test, or adapt to accessibility preferences.

Tiqlyne Motion Engine separates three concerns: core data and planning, platform execution, and reusable motion definitions. A timeline can be built and inspected without a browser; a driver can translate the same contract to a runtime; a pack can provide a shared motion vocabulary.

Version 0.1.0 keeps the scope deliberately small. It provides a TypeScript core, a Web Animations API driver, and three basic motions. The goal is a dependable foundation—not a promise that every animation style or framework integration already exists.
