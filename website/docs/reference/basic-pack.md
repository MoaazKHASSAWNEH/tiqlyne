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
import { DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

await motion.play(element, {
  id: 'card-enter',
  type: 'slide-in',
  options: { direction: 'left', distance: 32, fade: true }
});
```

Invalid fade ordering fails planning with `invalid-motion-options`. Direction values are `left`, `right`, `top`, and `bottom`; invalid raw values normalize to `bottom`. No motion beyond the three listed above is available from this package in 0.1.0.

---

## Direction disambiguation

:::warning Two different `direction` fields
There are two completely separate `direction` options in this engine. Do not confuse them.
:::

**`slide-in` motion option `direction`** — controls which side the element enters from:

```ts
// slide-in's motion option direction
await motion.play(element, {
  id: 'panel-enter',
  type: 'slide-in',
  options: { direction: 'left' } // left | right | top | bottom
});
```

**Timeline step `direction`** — controls how a step plays back:

```ts
// timeline playback direction — completely separate concept
track.step({ direction: 'reverse' }, (step) => {
  step.from({ opacity: 0 });
  step.to({ opacity: 1 });
});
```

| Context                  | Field               | Valid values                                          |
| ------------------------ | ------------------- | ----------------------------------------------------- |
| `slide-in` motion option | `options.direction` | `left`, `right`, `top`, `bottom`                      |
| Timeline step / defaults | `direction`         | `normal`, `reverse`, `alternate`, `alternate-reverse` |

---

## Related pages

- [Basic motions guide](../guides/basic-motions.md)
- [Package overview](../packages/motion-pack-basic.md)
- [Timeline timing options](../guides/timeline-timing-options.md)
- [Fade and slide examples](../examples/fade-in.md)
