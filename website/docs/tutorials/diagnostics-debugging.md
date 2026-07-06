---
sidebar_position: 10
---

# Debug with diagnostics

## Goal

Determine why a registered motion did not play.

```ts
const result = await motion.play(element, {
  id: 'debug-fade',
  type: 'fade-in',
  options: { fromOpacity: 1, toOpacity: 0 }
});

console.log('status:', result.status);
console.log('reason:', result.reason);
console.log('validation errors:', result.error);

for (const diagnostic of result.diagnostics ?? []) {
  console.log(diagnostic.level, diagnostic.source, diagnostic.code, diagnostic.message);
}
```

This fade ordering is invalid, so planning returns `failed` with reason `invalid-motion-options`. For direct timelines, run `validateMotionTimeline`, `inspectMotionTimeline`, or `motion.planTimeline` to narrow down structural problems.

## What you learned

Reasons summarize outcomes; diagnostics provide structured details. Not every result includes diagnostics.

## Next steps

Use [Troubleshooting](../guides/troubleshooting.md), then build a [custom motion](./custom-motion-definition.md).
