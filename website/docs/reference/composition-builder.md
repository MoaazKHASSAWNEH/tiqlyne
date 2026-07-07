---
sidebar_position: 9
---

# Composition builder

`createMotionComposition(callback)` builds an ordered list of registered-motion and direct-timeline items. Compilation resolves all items into one timeline.

```ts
import { createMotionComposition, compileMotionComposition } from '@tiqlyne/motion-core';

const composition = createMotionComposition((composition) => {
  composition.defaults({ easing: 'ease-out', fill: 'both' });
  composition.label('content', 200);

  composition.motion('fade-in', {
    label: 'fade',
    target: { type: 'self' },
    defaults: { duration: 200 }
  });

  composition.motion('slide-in', {
    at: 'content',
    options: { direction: 'bottom', distance: 24, fade: false },
    defaults: { duration: 300 }
  });

  composition.timeline(detailsTimeline, {
    at: { label: 'content', offset: 100 },
    target: { type: 'child', name: 'details' }
  });
});

const timeline = compileMotionComposition(composition, { registry });
```

## API

| Method                       | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `defaults(defaults)`         | Merge composition-level timeline defaults. |
| `label(name, position)`      | Add or replace one absolute label.         |
| `labels(record)`             | Merge several labels.                      |
| `motion(type, input?)`       | Append a registered motion item.           |
| `timeline(timeline, input?)` | Append a direct timeline item.             |
| `build()`                    | Return a snapshot definition.              |

Motion inputs accept `label`, `target`, `options`, `at`, and `defaults`; timeline inputs accept the same fields except `options`.

## Item `at` — positioning

Item `at` uses the same `MotionStepPosition` forms as step `at`:

| Form | Example | Meaning |
| --- | --- | --- |
| `number` | `at: 200` | Start item at 200 ms |
| `string` | `at: 'content'` | Start at the named label |
| `{ label, offset? }` | `at: { label: 'content', offset: 50 }` | Label time plus offset |
| `{ anchor, offset? }` | `at: { anchor: 'previous-end', offset: 100 }` | Anchor (unlabelled items only) |

:::warning Labelled items cannot use anchor-based `at`
In 0.1.0, a composition item with a `label` **cannot** use `{ anchor: ... }` as its `at` value. The compiler resolves label positions before processing anchors. Use an absolute time instead.
:::

## Item `label` — exposing positions

When an item has a `label`, the compiler adds that label to the compiled timeline at the item's resolved start position. This label can then be used with `jumpToLabel`.

Compilation requires a registry. Unknown motion types, invalid motion options, and invalid compiled timelines throw `MotionPlanningError`; engine composition methods translate planning failures into failed playback results.

## Compilation error codes

| Code | Cause |
| --- | --- |
| `composition-empty` | Composition has no items |
| `composition-duplicate-label` | Two items share the same label |
| `composition-item-label-anchor-position-unsupported` | Labelled item uses anchor-based `at` |
| `composition-item-label-reference-missing` | Item `at` references unknown label |
| `composition-item-unknown-motion-type` | Motion type not in registry |
| `composition-item-invalid-options` | Motion options failed validation |
| `composition-invalid-timeline` | Compiled timeline is invalid |

## Related pages

- [Compositions guide](../guides/compositions.md)
- [Timeline positions and labels](../guides/timeline-positions-and-labels.md)
- [Composition example](../examples/composition.md)
- [Motion composition model](./motion-composition.md)
