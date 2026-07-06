---
sidebar_position: 4
---

# Animate a card

## Goal

Slide and fade a card into place using typed basic-motion options.

## Prerequisites

Use the `motion` engine from [Web engine setup](./web-engine-setup.md).

```html
<article id="feature-card">
  <h2>Inspectable motion</h2>
  <p>Plan and debug before playback.</p>
</article>
```

```ts
const card = document.querySelector('#feature-card');
if (!card) throw new Error('Feature card not found');

const result = await motion.play(card, {
  id: 'feature-card-enter',
  type: 'slide-in',
  duration: 360,
  options: { direction: 'bottom', distance: 24, fade: true }
});

if (result.status === 'failed') console.error(result.reason, result.diagnostics);
```

## Expected result

The card starts 24 px below its final position and reaches full opacity.

## What you learned

`MotionConfig` requires a stable `id`; definition-specific values belong under `options`.

## Next steps

Animate [child targets](./child-targets.md). See the [slide-in example](../examples/slide-in.md).
