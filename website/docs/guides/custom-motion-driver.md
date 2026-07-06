---
sidebar_position: 14
---

# Custom motion driver

A driver translates core timelines to a runtime. Only `name` and async `play` are required.

```ts
import type {
  MotionDriver,
  MotionPlayOptions,
  MotionPlaybackResult,
  MotionTimelineDefinition
} from '@tiqlyne/motion-core';

class CanvasMotionDriver implements MotionDriver<HTMLCanvasElement> {
  readonly name = 'canvas';

  async play(
    target: HTMLCanvasElement,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    // Resolve timeline target references and schedule drawing for this runtime.
    void target;
    void timeline;
    void options;
    return { status: 'finished' };
  }
}

const motion = createMotionEngine<HTMLCanvasElement>({
  driver: new CanvasMotionDriver()
});
```

Drivers may implement async `cancel`, `finish`, and `reset`, plus synchronous `createPlayback`. Without `createPlayback`, the engine returns `PromiseMotionPlaybackController`; advanced controls are then reported as unsupported.

`MotionPlayOptions` contains normalized `trigger`, `respectReducedMotion`, `reducedMotionStrategy`, optional `reducedMotionTimeline`, `conflictStrategy`, optional execution plan, and validation flags. Treat timelines and options as readonly. Return structured results and diagnostics for expected failures instead of leaking platform exceptions.

For tests, `NoopMotionDriver` always skips with `noop-driver`. `TestMotionDriver` records play/control calls and returns deterministic results.
