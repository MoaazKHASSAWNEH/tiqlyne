---
sidebar_position: 11
---

# Web motion driver

`WebMotionDriver` implements `MotionDriver<Element>` with the Web Animations API.

```ts
type WebMotionDriverOptions = {
  readonly reducedMotion?: boolean;
  readonly cancelPreviousAnimations?: boolean;
};

const driver = new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  cancelPreviousAnimations: true
});
```

## Playback pipeline

`play` selects the normal or reduced timeline, validates it when needed, applies defaults, resolves every track target, handles active-animation conflicts, creates WAAPI animations, and resolves a `MotionPlaybackResult`. A missing target fails with `target-not-found`; creation errors use `web-animation-error`.

Finite timelines resolve when all animations finish. Infinite timelines return `running` with reason `web-playback-infinite`. `finish` is unsupported for infinite animations at controller level.

## Target-level methods

`cancel(target)`, `finish(target)`, and `reset(target)` operate on `target.getAnimations({ subtree: true })`. Reset also removes the root target's complete `style` attribute, which is important if the application owns inline styles.

## Controller

`createPlayback` returns `WebMotionPlaybackController`. It supports state snapshots, time/progress/label seeking, forward/backward playback, positive playback-rate changes, pause, resume, cancel, finish, events, and disposal. Normal invalid transitions return skipped results and diagnostics instead of throwing.

## Browser expectations

The runtime requires `Element.animate`, `Element.getAnimations`, `Animation`, and related WAAPI behavior. The driver receives a reduced-motion boolean; it does not subscribe to media-query changes. Target selectors must be valid CSS selectors.

## Common mistakes

- Passing `Document` or a selector string as the engine target instead of an `Element`.
- Expecting `cancelPreviousAnimations: false` to disable all conflict handling; it only converts requested `replace` behavior to `parallel`.
- Calling `finish()` for infinite playback.
- Forgetting that `reset()` removes all inline styles on the root.

## Related pages

- [Web package guide](../packages/motion-web.md)
- [Motion targets](./motion-targets.md)
- [Conflict strategy](./conflict-strategy.md)
- [Reduced motion](./reduced-motion.md)
