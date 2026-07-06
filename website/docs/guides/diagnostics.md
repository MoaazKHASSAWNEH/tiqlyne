---
sidebar_position: 7
---

# Diagnostics

Diagnostics explain what happened during validation, planning or playback.

They help developers understand why an animation was skipped, why a timeline is invalid or why a driver could not execute a request.

## Where diagnostics appear

Diagnostics can appear in:

- validation results;
- execution plans;
- playback results;
- driver results;
- test assertions;
- future builder UI feedback.

## Playback result diagnostics

```ts
const result = await motion.play(element, {
  id: 'diagnostic-example',
  type: 'slide-in',
  trigger: 'manual'
});

if (result.diagnostics?.length) {
  console.log(result.diagnostics);
}
```

## Diagnostic shape

A diagnostic usually contains:

| Field      | Purpose                       |
| ---------- | ----------------------------- |
| `level`    | Severity level.               |
| `code`     | Stable machine-readable code. |
| `message`  | Human-readable explanation.   |
| `source`   | Origin of the diagnostic.     |
| `metadata` | Optional additional context.  |

## Status and reason

Playback results include a `status` and a `reason`.

```ts
console.log(result.status);
console.log(result.reason);
```

The status describes the result category. The reason explains why that status happened.

## Common diagnostic use cases

Use diagnostics to:

- explain invalid timelines;
- surface option validation errors;
- debug custom motion definitions;
- detect unsupported driver features;
- build user-friendly authoring errors;
- write precise tests;
- inspect reduced motion behavior.

## Validation issues

Validation can detect problems such as:

- invalid targets;
- invalid keyframes;
- invalid timing values;
- invalid labels;
- invalid stagger configuration;
- unsupported or risky keyframe properties.

## Driver diagnostics

Drivers should return diagnostics when platform execution cannot happen as expected.

For example, a browser driver can report issues related to target resolution, invalid timelines or unsupported playback operations.

## Best practices

Use diagnostics as developer-facing explanations.

For public UI messages, you can map diagnostic codes to clearer user-facing copy.
