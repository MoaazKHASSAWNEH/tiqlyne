---
sidebar_position: 3
---

# Limitations

Version 0.1.0 has these intentional boundaries:

- the official runtime driver targets browsers with the Web Animations API;
- reduced-motion preference detection must be passed to `WebMotionDriver`; it is not observed automatically;
- `cancelPreviousAnimations: false` downgrades `replace` to `parallel`;
- selector targets can resolve many elements, while `child` and `named` resolve only the first match;
- any unresolved track makes Web playback fail with `target-not-found`;
- Web target `reset()` removes the root element's entire inline `style` attribute;
- finishing an infinite Web animation is unsupported;
- the promise-based fallback controller cannot provide native seeking, direction, rate, pause, or resume controls;
- step-level `playbackRate` is validated but is not applied to created Web `Animation` objects in 0.1.0; use a Web playback controller's `setPlaybackRate()` for runtime speed changes;
- sampler interpolation is deliberately limited and progress sampling cannot sample infinite timelines;
- the `progress` playback event exists but is not continuously emitted by the Web controller;
- labelled composition items cannot use anchor-based placement, and nested direct-timeline labels are not merged automatically;
- option `step`, string length, and color fields are tooling metadata rather than complete runtime validation;
- the basic pack includes only `fade-in`, `fade-out`, and `slide-in`.

`slide-out`, zoom, shake, bounce, pulse, framework adapters, visual tooling, and additional drivers are future work rather than 0.1.0 features.
