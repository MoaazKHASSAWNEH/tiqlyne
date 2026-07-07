---
sidebar_position: 15
---

# Troubleshooting

Start by logging the complete result: `status`, `reason`, `error`, and `diagnostics`. For timelines, also call `validateMotionTimeline`, `inspectMotionTimeline`, or `motion.planTimeline`.

## Quick diagnosis steps

1. Log the full playback result object.
2. Check `result.reason` against the table below.
3. Check `result.diagnostics` for engine codes with more context.
4. For timeline issues, run `validateMotionTimeline(timeline)` separately and inspect its `diagnostics`.

---

## Validation error codes

These codes appear in `diagnostics` and point to the exact rule that failed.

| Diagnostic code                    | Meaning                                                      | Fix                                                               | Related page                                               |
| ---------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `timeline-empty-tracks`            | Timeline has no tracks                                       | Add at least one track                                            | [Timeline model](../reference/motion-timeline.md)          |
| `timeline-empty-steps`             | A track has no steps                                         | Add at least one step to the track                                | [Timeline model](../reference/motion-timeline.md)          |
| `timeline-empty-keyframes`         | A step has no keyframes                                      | Add at least one keyframe                                         | [Timeline builder](../reference/timeline-builder.md)       |
| `timeline-invalid-duration`        | `duration` is not a finite non-negative number               | Use a value ≥ 0                                                   | [Timing options](./timeline-timing-options.md)             |
| `timeline-invalid-delay`           | `delay` is not a finite non-negative number                  | Use a value ≥ 0                                                   | [Timing options](./timeline-timing-options.md)             |
| `timeline-invalid-fill`            | `fill` is not a valid fill mode                              | Use `none`, `forwards`, `backwards`, `both`, or `auto`            | [Timing options](./timeline-timing-options.md)             |
| `timeline-invalid-iterations`      | `iterations` is not a positive finite number or `'infinite'` | Use `iterations > 0` or `'infinite'`; do not use `0` or negative  | [Timing options](./timeline-timing-options.md)             |
| `timeline-invalid-direction`       | `direction` is not a valid playback direction                | Use `normal`, `reverse`, `alternate`, or `alternate-reverse`      | [Timing options](./timeline-timing-options.md)             |
| `timeline-yoyo-direction-conflict` | `yoyo: true` and `direction` are both set on the same step   | Remove `direction` or use `direction: 'alternate'` without `yoyo` | [Timing options](./timeline-timing-options.md)             |
| `timeline-invalid-end-delay`       | `endDelay` is negative or non-finite                         | Use a value ≥ 0                                                   | [Timing options](./timeline-timing-options.md)             |
| `timeline-invalid-playback-rate`   | `playbackRate` is zero, negative, or non-finite              | Use a positive value > 0                                          | [Timing options](./timeline-timing-options.md)             |
| `timeline-missing-label-reference` | A step references a label that was never declared            | Declare `timeline.label(name, ms)` before using it in `at`        | [Positions and labels](./timeline-positions-and-labels.md) |
| `timeline-invalid-step-offset`     | Step `offset` is outside 0–1                                 | The low-level `offset` field must be between 0 and 1              | [Timeline model](../reference/motion-timeline.md)          |

---

## Engine reason codes

These codes appear in `result.reason` and describe why playback ended or was skipped.

| Reason code                                          | Symptom                  | Likely cause                                        | Fix                                                                        |
| ---------------------------------------------------- | ------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------- |
| `unknown-motion-type`                                | Motion never starts      | Definition was not registered                       | Call `registerBasicMotions(registry)` or register your definition          |
| `motion-disabled`                                    | Motion is skipped        | Config has `enabled: false`                         | Enable it or treat the skip as expected                                    |
| `invalid-motion-options`                             | Planning fails           | Definition validator rejected normalized options    | For fades, ensure opacity is increasing/decreasing. Inspect `result.error` |
| `invalid-timeline`                                   | Planning fails           | Timeline validation errors                          | Run `validateMotionTimeline(timeline)` and inspect diagnostics             |
| `invalid-reduced-motion-timeline`                    | Fallback playback fails  | Reduced motion definition returned invalid timeline | Validate `buildReducedMotionTimeline` output separately                    |
| `target-not-found`                                   | No animation plays       | A web track resolved zero elements                  | Check root scope, selector, `data-motion-child`, `data-motion-name` values |
| `reduced-motion`                                     | Playback skipped         | Strategy is `skip` and driver preference is true    | Use `simplify` or `preserve` when appropriate                              |
| `motion-conflict-ignored`                            | Animation does not start | Strategy is `ignore` and an active animation exists | Wait, use `replace`, or use `parallel`                                     |
| `composition-empty`                                  | Compilation fails        | Composition has no items                            | Add at least one item                                                      |
| `composition-duplicate-label`                        | Compilation fails        | Two items share the same label                      | Use unique labels per composition item                                     |
| `composition-item-label-anchor-position-unsupported` | Compilation fails        | Labelled item uses anchor-based `at`                | Use an absolute `at` time for labelled items in 0.1.0                      |
| `composition-item-label-reference-missing`           | Compilation fails        | Item `at` references an unknown composition label   | Declare the label before it is referenced                                  |
| `composition-item-unknown-motion-type`               | Compilation fails        | Motion type is not in the registry                  | Register the motion before compiling                                       |
| `composition-item-invalid-options`                   | Compilation fails        | Motion options failed validation                    | Fix the motion options for the flagged item                                |
| `composition-invalid-timeline`                       | Compilation fails        | Compiled timeline is invalid                        | Validate the compiled timeline separately                                  |

---

## Playback controller issues

| Symptom                                  | Likely cause                              | Fix                                                        |
| ---------------------------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| `jumpToLabel` returns skipped            | Label not found or controller is terminal | Declare the label and call before termination              |
| `seekProgress` returns skipped           | Infinite timeline or non-finite progress  | Seek by absolute time for infinite timelines               |
| `finish` returns skipped                 | Infinite animation                        | Cancel it or change `iterations` first                     |
| Control returns skipped after `finished` | Controller is in a terminal state         | Create a new controller                                    |
| `pause` / `resume` returns skipped       | Invalid transition                        | Check `status` before calling                              |
| Controller has no seek support           | Using the promise fallback controller     | Use `WebMotionDriver` which provides the native controller |

---

## Web driver issues

| Symptom                                         | Likely cause                                                       | Fix                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Animation does not start in browser             | `WebMotionDriver` not configured                                   | Pass `driver: new WebMotionDriver()` to `createMotionEngine`                                 |
| Inline styles removed after `reset()`           | `WebMotionDriver.reset(target)` removes the full `style` attribute | Do not use `reset()` if you own inline styles; restore them explicitly                       |
| Reduced motion not detected                     | Driver does not auto-observe `matchMedia`                          | Pass `reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches` manually |
| `cancelPreviousAnimations: false` has no effect | It does not disable conflict handling                              | It only converts `replace` to `parallel`; other strategies still apply                       |
| `finish()` skipped on infinite animation        | Web Animations API limitation                                      | Cancel the animation or change `iterations` first                                            |

---

## General issues

| Symptom                                    | Likely cause                                | Fix                                                                                                |
| ------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Package import fails                       | Import is internal or package not installed | Import only from `@tiqlyne/motion-core`, `@tiqlyne/motion-web`, `@tiqlyne/motion-pack-basic` roots |
| TypeScript errors on `MotionConfig`        | Using wrong field                           | Check `MotionConfig` — it has no `fill` field; put `fill` in timeline defaults                     |
| Animations complete but element snaps back | `fill` not set                              | Use `fill: 'both'` on the step or in defaults                                                      |
| Steps run at wrong time                    | Misusing `at: 0`                            | `at: 0` overrides sequencing and places the step at time 0                                         |

---

Applications should use matching published versions of core, Web, and the basic pack. Repository contributors can follow [Local development](../project/local-development.md) for workspace setup.

## Related pages

- [Diagnostics](./diagnostics.md)
- [Motion targets](../reference/motion-targets.md)
- [Playback result reasons](../reference/playback-result.md)
- [Timeline timing options](./timeline-timing-options.md)
- [Timeline positions and labels](./timeline-positions-and-labels.md)
- [Limitations](../release/limitations.md)
