---
sidebar_position: 22
---

# Basic pack reference

`@tiqlyne/motion-pack-basic` 0.1.0 exports only `FadeInMotion`, `FadeOutMotion`, `SlideInMotion`, their option types, `SlideInDirection`, `registerBasicMotions`, and `motionPackBasicVersion`.

| Type / class                 | Category   | Options                                                                                                   | Validation / output                                                                                                |
| ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `fade-in` / `FadeInMotion`   | `entrance` | `fromOpacity` default `0`, `toOpacity` default `1`; both range `0..1`, step `0.05`                        | Requires increasing opacity; one `self` step, config timing, `fill: both`.                                         |
| `fade-out` / `FadeOutMotion` | `exit`     | `fromOpacity` default `1`, `toOpacity` default `0`; both range `0..1`, step `0.05`                        | Requires decreasing opacity; one `self` step, config timing, `fill: both`.                                         |
| `slide-in` / `SlideInMotion` | `entrance` | `direction` default `bottom`; `distance` default `24`, range `0..300`, step `1` px; `fade` default `true` | Translates from selected side to zero and optionally fades; custom opacity-only reduced timeline capped at 150 ms. |

Labels/descriptions are respectively “Fade in” / “Makes the target appear progressively using opacity.”, “Fade out” / “Makes the target disappear progressively using opacity.”, and “Slide in” / “Makes the target enter with a directional slide.”

```ts
const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

await motion.play(element, {
  id: 'card-enter',
  type: 'slide-in',
  options: { direction: 'left', distance: 32, fade: true }
});
```

Invalid fade ordering fails planning with `invalid-motion-options`. Direction values are `left`, `right`, `top`, and `bottom`; invalid raw values normalize to `bottom`. No motion beyond the three listed above is available from this package in 0.1.0.

## Related pages

- [Basic motions guide](../guides/basic-motions.md)
- [Package overview](../packages/motion-pack-basic.md)
- [Fade and slide examples](../examples/fade-in.md)
