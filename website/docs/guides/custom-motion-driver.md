---
sidebar_position: 14
---

# Custom motion driver

Use a custom driver when timelines must execute outside the Web Animations API—for example canvas, native UI, a test runtime, or another animation library.

## Complete minimal driver

```ts
import {
  PromiseMotionPlaybackController,
  createMotionErrorDiagnostic,
  type MotionDriver,
  type MotionPlayOptions,
  type MotionPlaybackController,
  type MotionPlaybackResult,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

class CanvasMotionDriver implements MotionDriver<HTMLCanvasElement> {
  readonly name = 'canvas';

  async play(
    target: HTMLCanvasElement,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    try {
      // Resolve symbolic targets, schedule steps, and draw frames here.
      void target;
      void timeline;
      void options.executionPlan;
      return { status: 'finished', reason: 'canvas-playback-finished' };
    } catch (error) {
      return {
        status: 'failed',
        reason: 'canvas-playback-failed',
        error,
        diagnostics: [
          createMotionErrorDiagnostic(
            'canvas-playback-failed',
            'Canvas playback could not be completed.',
            this.name
          )
        ]
      };
    }
  }

  async cancel(_target: HTMLCanvasElement): Promise<MotionPlaybackResult> {
    return { status: 'cancelled', reason: 'canvas-cancelled' };
  }

  async finish(_target: HTMLCanvasElement): Promise<MotionPlaybackResult> {
    return { status: 'finished', reason: 'canvas-finished' };
  }

  async reset(_target: HTMLCanvasElement): Promise<MotionPlaybackResult> {
    return { status: 'finished', reason: 'canvas-reset' };
  }

  createPlayback(
    target: HTMLCanvasElement,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): MotionPlaybackController {
    return new PromiseMotionPlaybackController(
      `canvas_${Date.now()}`,
      this.play(target, timeline, options),
      () => this.cancel(target),
      () => this.finish(target)
    );
  }
}
```

This controller supports completion/cancel/finish paths but deliberately reports seek, direction, rate, pause, and resume as unsupported. A fully native controller must implement `MotionPlaybackController` (usually by extending `BaseMotionPlaybackController`) and keep its status, events, and results synchronized with the runtime.

## Driver inputs

`MotionPlayOptions` contains required normalized `trigger`, `respectReducedMotion`, `reducedMotionStrategy`, and `conflictStrategy`; optional reduced timeline, execution plan, and validation flags may also be present. Treat all inputs as readonly.

Drivers own target resolution, runtime conversion, reduced-motion/conflict behavior, resource cleanup, and platform error mapping. Return structured results for expected outcomes; use custom string reasons/codes with a stable namespace.

For deterministic tests, use `NoopMotionDriver` or `TestMotionDriver` before building a production adapter.

## Common mistakes

- Mutating the timeline or execution plan.
- Throwing for routine unsupported operations instead of returning a result.
- Claiming controller support without implementing state transitions/events.
- Ignoring infinite iterations or cleanup after cancellation.
- Importing internal files instead of public package exports.

## Related pages

- [Motion driver reference](../reference/motion-driver.md)
- [Playback controller contract](../reference/playback-controller.md)
- [Diagnostics reference](../reference/diagnostics.md)
