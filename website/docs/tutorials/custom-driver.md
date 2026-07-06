---
sidebar_position: 12
---

# Create a custom driver

## Goal

Implement the smallest valid platform adapter.

```ts
import type {
  MotionDriver,
  MotionPlayOptions,
  MotionPlaybackResult,
  MotionTimelineDefinition
} from '@tiqlyne/motion-core';
import { createMotionEngine } from '@tiqlyne/motion-core';

class LoggingDriver<TTarget> implements MotionDriver<TTarget> {
  readonly name = 'logging';

  async play(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    console.log({ target, timeline, options });
    return { status: 'finished', reason: 'logging-driver-finished' };
  }
}

const motion = createMotionEngine({ driver: new LoggingDriver<unknown>() });
```

The engine can play through this driver, but advanced controller operations use the limited promise fallback because `createPlayback` is absent.

## What you learned

Drivers own platform execution, target resolution, cleanup, reduced-motion behavior, conflicts, and result mapping.

## Next steps

See the [custom driver guide](../guides/custom-motion-driver.md) for cancel/finish/reset, diagnostics, and controller support.
