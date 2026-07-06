---
sidebar_position: 3
---

# Motion definition

A motion definition is a reusable animation unit.

It receives a build context and returns a timeline.

## Main APIs

- `MotionDefinition`
- `BaseMotionDefinition`
- `SchemaMotionDefinition`
- `MotionBuildContext`
- `defineMotionOptions`
- `InferMotionOptions`
- option builders
- option validators

## Definition metadata

A definition usually exposes:

| Field         | Description                                   |
| ------------- | --------------------------------------------- |
| `type`        | Stable motion identifier.                     |
| `label`       | Human-readable name.                          |
| `description` | Human-readable description.                   |
| `category`    | Motion category such as `entrance` or `exit`. |

## Timeline building

The main behavior of a definition is to build a timeline from a context.

```ts
buildTimeline(context) {
  return createMotionTimeline((timeline) => {
    timeline.track('self', (track) => {
      track.step({}, (step) => {
        step.from({ opacity: 0 });
        step.to({ opacity: 1 });
      });
    });
  });
}
```

## Reduced motion

A definition can expose a reduced motion timeline when a simplified animation should be used.

## Best practices

Keep definitions platform-independent.

Do not access the DOM from a core motion definition.
