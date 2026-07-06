---
title: The road to 0.1.0
description: What the first Tiqlyne Motion Engine release establishes—and what it leaves for later.
slug: road-to-0-1-0
---

Version 0.1.0 establishes the public package boundary: `@tiqlyne/motion-core`, `@tiqlyne/motion-web`, and `@tiqlyne/motion-pack-basic`.

The release includes registered definitions, direct timelines, compositions, planning, validation, diagnostics, playback controllers, events, sampling, inspection, reduced-motion policy, Web playback, and three basic motions: `fade-in`, `fade-out`, and `slide-in`.

Pre-1.0 means the public API may still evolve. High-level engine and builder APIs are the recommended application surface; lower-level planning, scheduling, conversion, and validation helpers are intended for advanced tooling and may change more readily.

Framework adapters, a visual builder, additional production drivers, and a broad preset catalogue are not part of 0.1.0. Keeping those boundaries visible is part of making the first release useful.
