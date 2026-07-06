---
sidebar_position: 2
---

# Fade in example

The `fade-in` motion makes the target appear progressively using opacity.

## Main behavior

It animates opacity from a lower value to a higher value.

Default values:

- fromOpacity: 0
- toOpacity: 1

## Use cases

Use `fade-in` for cards, dialogs, notifications, sections and content that should appear softly.

## Timing

The motion can use engine defaults or per-call timing values such as duration, delay and easing.

```ts
const result = await motion.play(element, {
  id: 'dialog-enter',
  type: 'fade-in',
  duration: 200,
  easing: 'ease-out',
  options: { fromOpacity: 0, toOpacity: 1 }
});
```
