---
title: Reduced motion and accessible animation
description: Reduced motion as a policy shared by configs, definitions, and drivers.
slug: reduced-motion-and-accessibility
---

Reduced motion is not one universal replacement animation. Applications need a policy, reusable motions may know the safest alternative, and the runtime must know the user's platform preference.

Tiqlyne represents those responsibilities explicitly. A config chooses `skip`, `simplify`, or `preserve`. A definition may provide `buildReducedMotionTimeline`. The Web driver receives a reduced-motion preference snapshot and selects the appropriate timeline.

In 0.1.0 the driver does not monitor `matchMedia` automatically. Applications that support live preference changes must update their wiring. The basic `slide-in` motion provides a short opacity-only fallback; other definitions may use the Web driver's generic simplification.

Accessible motion also includes restraint: animation should support comprehension, preserve semantic HTML, and never become the only way information is conveyed.
