---
sidebar_position: 9
---

# Composition builder

`createMotionComposition(callback)` builds an ordered list of registered-motion and direct-timeline items. Compilation resolves all items into one timeline.

```ts
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

Motion inputs accept `label`, `target`, `options`, `at`, and `defaults`; timeline inputs accept the same fields except `options`. Item labels are exposed during compilation, and `at` uses the normal `MotionStepPosition` forms.

Compilation requires a registry. Unknown motion types, invalid motion options, and invalid compiled timelines throw `MotionPlanningError`; engine composition methods translate planning failures into failed playback results. A labelled item cannot use an anchor-based `at` position in 0.1.0 because the compiler cannot resolve that item's absolute label time, although anchors can still shift unlabelled item steps.

Use a composition for a reusable page entrance or sequence assembled from known motions. Use a direct timeline for tightly coupled keyframes, and a single registered definition for one reusable semantic motion.

## Related pages

- [Compositions guide](../guides/compositions.md)
- [Composition example](../examples/composition.md)
- [Motion composition model](./motion-composition.md)
