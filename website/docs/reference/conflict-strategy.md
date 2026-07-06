---
sidebar_position: 21
---

# Conflict strategy

`MotionConflictStrategy` has exactly three values.

| Value      | Web driver behavior                                                                  |
| ---------- | ------------------------------------------------------------------------------------ |
| `replace`  | Cancel active animations on all resolved targets before creating the new ones.       |
| `parallel` | Leave active animations running and create the new ones.                             |
| `ignore`   | If any resolved target has an active animation, skip with `motion-conflict-ignored`. |

Animations in `running`, `paused`, or pending state are considered active. Checks include each target's subtree through `getAnimations({ subtree: true })`.

```ts
await motion.play(element, {
  id: 'notification-enter',
  type: 'fade-in',
  conflictStrategy: 'ignore'
});
```

The default normalized strategy is `replace`. When `WebMotionDriver({ cancelPreviousAnimations: false })` receives `replace`, its effective strategy becomes `parallel`; `ignore` and `parallel` are unchanged.

Use `replace` for state transitions, `parallel` for intentional layered effects, and `ignore` for idempotent triggers. A common mistake is treating `ignore` as a queue—there is no queue in 0.1.0.

## Related pages

- [Web driver](./web-motion-driver.md)
- [Motion config](./motion-config.md)
- [Troubleshooting](../guides/troubleshooting.md)
