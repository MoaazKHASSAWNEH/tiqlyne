---
sidebar_position: 6
---

# Motion driver

A motion driver executes timelines on a platform.

The core package defines the driver contract. Platform packages implement it.

## Official Web driver

The official browser driver is `WebMotionDriver` from `@tiqlyne/motion-web`.

## Driver role

A driver receives a target, a timeline and play options.

It adapts the platform-independent timeline model to a concrete runtime and returns a playback result.

## Optional capabilities

A driver can support target-level operations such as cancel, finish and reset.

A driver can also expose playback controller support.

The required signature is `play(target, timeline, options): Promise<MotionPlaybackResult>`. Optional methods are async `cancel`, `finish`, and `reset`, plus synchronous `createPlayback(target, timeline, options): MotionPlaybackController`.

```ts
interface MotionDriver<TTarget = unknown> {
  readonly name: string;
  play(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult>;
  cancel?(target: TTarget): Promise<MotionPlaybackResult>;
  finish?(target: TTarget): Promise<MotionPlaybackResult>;
  reset?(target: TTarget): Promise<MotionPlaybackResult>;
  createPlayback?(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): MotionPlaybackController;
}
```

| `MotionPlayOptions` field         | Meaning                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `trigger`                         | Normalized initiating trigger.                              |
| `respectReducedMotion`            | Whether the driver should apply its platform preference.    |
| `reducedMotionStrategy`           | `skip`, `simplify`, or `preserve`.                          |
| `reducedMotionTimeline?`          | Optional definition-provided/direct simplified timeline.    |
| `conflictStrategy`                | `replace`, `parallel`, or `ignore`.                         |
| `executionPlan?`                  | Prepared/scheduled main and reduced timelines plus summary. |
| `timelineValidated?`              | Main timeline was validated by the engine.                  |
| `reducedMotionTimelineValidated?` | Reduced timeline was validated by the engine.               |

The engine supplies these values. Flags are optimization information, not permission to mutate data. A driver without `createPlayback` remains valid; the engine wraps its promise in a limited fallback controller.

See the [custom driver guide](../guides/custom-motion-driver.md) for minimal, control-method, diagnostic, and controller examples.

## Boundaries

A driver should not redefine the core motion model.

It should execute timelines produced by the core.

## Common mistakes

- Coupling a general driver to one registered motion type.
- Returning a successful result before resources are safely scheduled or completed.
- Losing custom error context instead of attaching `error` and diagnostics.
- Revalidating an engine-validated timeline unnecessarily.
