---
sidebar_position: 3
---

# Fade out example

The `fade-out` motion makes the target disappear progressively using opacity.

## Main behavior

It animates opacity from a higher value to a lower value.

Default values:

- fromOpacity: 1
- toOpacity: 0

## Use cases

Use `fade-out` for cards, dialogs, notifications, sections and content that should disappear softly.

## Timing

The motion can use engine defaults or per-call timing values such as duration, delay and easing.

```ts
const result = await motion.play(element, {
  id: 'dialog-exit',
  type: 'fade-out',
  duration: 180,
  easing: 'ease-in',
  options: { fromOpacity: 1, toOpacity: 0 }
});
```
