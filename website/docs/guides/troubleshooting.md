---
sidebar_position: 15
---

# Troubleshooting

Start by logging the complete result, including `status`, `reason`, `error`, and `diagnostics`. For timelines, also call `validateMotionTimeline`, `inspectMotionTimeline`, or `motion.planTimeline`.

| Symptom / reason                  | Likely cause                                                      | Fix                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Animation does not start          | Target missing, motion skipped, or driver not configured          | Check the result and use `WebMotionDriver` for browser playback. `MotionEngineConfig.driver` is required. |
| `unknown-motion-type`             | Definition was not registered                                     | Register the definition or call `registerBasicMotions` before playing.                                    |
| `motion-disabled`                 | Config has `enabled: false`                                       | Enable it or treat the skip as expected policy.                                                           |
| `invalid-motion-options`          | Definition validator rejected normalized options                  | Inspect `result.error`; for fades, preserve increasing/decreasing ordering.                               |
| `invalid-timeline`                | Target, keyframes, timing, labels, or positions failed validation | Run `validateMotionTimeline` and inspect its diagnostics/errors.                                          |
| `invalid-reduced-motion-timeline` | Definition returned an invalid fallback                           | Validate `buildReducedMotionTimeline` output separately.                                                  |
| `target-not-found`                | At least one Web track resolved zero elements                     | Check root scope, selector, and exact `data-motion-child` / `data-motion-name` values.                    |
| `reduced-motion`                  | Strategy is `skip` and driver preference is true                  | Use `simplify` or `preserve` only when appropriate.                                                       |
| `motion-conflict-ignored`         | Strategy is `ignore` and an active animation exists               | Wait, use `replace`, or intentionally use `parallel`.                                                     |
| Controller operation is skipped   | Fallback controller or invalid state transition                   | Use the Web controller and inspect the exact reason/diagnostic.                                           |
| `jumpToLabel` fails               | Blank/unknown label or playback already terminal                  | Declare the label and call before termination.                                                            |
| `seekProgress` fails              | Duration unavailable/infinite or progress non-finite              | Seek by absolute time for infinite timelines.                                                             |
| Infinite `finish` is skipped      | WAAPI cannot meaningfully finish an infinite effect               | Cancel it or change its iterations first.                                                                 |
| Package import fails              | Import is internal or package was not installed/built             | Import only from package roots and install all direct dependencies.                                       |

For workspace installs, run `pnpm install` from the repository root. For npm consumers, use matching published versions of core, Web, and the basic pack.

## Related pages

- [Diagnostics](./diagnostics.md)
- [Motion targets](../reference/motion-targets.md)
- [Playback result reasons](../reference/playback-result.md)
- [Limitations](../release/limitations.md)
