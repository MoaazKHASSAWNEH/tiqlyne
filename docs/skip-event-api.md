# Structifyx Motion Engine - Skip Event API

> Status: developer-facing reference.
> Scope: `onSkip` global engine event.
> Goal: document when a motion operation is intentionally skipped, what payload is emitted, and how tooling should interpret it.

## 1. Why `onSkip` exists

`onSkip` observes cases where the engine receives a motion-related request but does not execute a real animation or control operation.

A skipped operation is not necessarily an error.

It usually means one of these things:

```txt
- the motion was explicitly disabled
- the requested motion type was not registered
- the driver does not support the requested control method
```

This is useful for:

```txt
- analytics
- debug logs
- visual builder inspection
- runtime diagnostics
- understanding why an animation did not play
- detecting unsupported driver capabilities
```

Without `onSkip`, these cases only appear as returned `MotionPlaybackResult` values. With `onSkip`, applications and tools can observe them globally.

## 2. Public callback

`onSkip` is configured through `createMotionEngine({ events })`.

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onSkip(event) {
      console.log(event.reason, event.result.status);
    }
  }
});
```

It is part of the global engine events object:

```ts
type MotionEngineEvents<TTarget = unknown> = {
  readonly onBeforePlan?: (event: MotionBeforePlanEvent<TTarget>) => void;
  readonly onPlan?: (event: MotionPlanEvent<TTarget>) => void;
  readonly onPlay?: (event: MotionPlayEvent<TTarget>) => void;
  readonly onFinish?: (event: MotionFinishEvent<TTarget>) => void;
  readonly onCancel?: (event: MotionCancelEvent<TTarget>) => void;
  readonly onSkip?: (event: MotionSkipEvent<TTarget>) => void;
  readonly onError?: (event: MotionErrorEvent<TTarget>) => void;
};
```

## 3. Type model

The current skip reasons are:

```ts
export type MotionSkipReason =
  | 'motion-disabled'
  | 'unknown-motion-type'
  | 'driver-cancel-not-supported'
  | 'driver-finish-not-supported'
  | 'driver-reset-not-supported';
```

The event payload is:

```ts
export type MotionSkipEvent<TTarget = unknown> = {
  readonly type: 'skip';
  readonly reason: MotionSkipReason;
  readonly result: MotionPlaybackResult;
  readonly timestamp: number;
  readonly target?: TTarget;
  readonly source?: MotionEngineEventSource;
  readonly motionId?: string;
  readonly motionType?: string;
};
```

Field meaning:

```txt
type
  Always skip.

reason
  Machine-readable reason explaining why the operation was skipped.

result
  The MotionPlaybackResult returned by the engine.
  It should have status: 'skipped'.

timestamp
  Date.now() value generated when the event is emitted.

target
  Present when the skipped operation has a target.

source
  Present when the skip belongs to a known engine source.
  Currently registered motion skips use source: 'registered-motion'.

motionId
  Present when a registered motion config provides an id.

motionType
  Present for registered motion skips.
```

## 4. Triggered cases

### 4.1 Disabled registered motion

When `motion.play(target, config)` receives a disabled motion config, playback is skipped before planning.

Input example:

```ts
await motion.play(element, {
  id: 'hero-intro',
  type: 'fade-in',
  enabled: false
});
```

Returned result:

```ts
{
  status: 'skipped',
  reason: 'motion-disabled'
}
```

Event shape:

```txt
type = skip
reason = motion-disabled
source = registered-motion
target = element
motionId = hero-intro
motionType = fade-in
result.status = skipped
result.reason = motion-disabled
```

Event order:

```txt
onSkip
return skipped result
```

No planning events are emitted in this case because the engine does not enter `plan()`.

```txt
onBeforePlan is not emitted
onPlan is not emitted
onPlay is not emitted
onFinish is not emitted
onError is not emitted
```

### 4.2 Unknown registered motion type

When `motion.play(target, config)` references a motion type that is not registered, playback is skipped before planning.

Input example:

```ts
await motion.play(element, {
  id: 'hero-intro',
  type: 'unknown-motion'
});
```

Returned result:

```ts
{
  status: 'skipped',
  reason: 'unknown-motion-type'
}
```

Event shape:

```txt
type = skip
reason = unknown-motion-type
source = registered-motion
target = element
motionId = hero-intro
motionType = unknown-motion
result.status = skipped
result.reason = unknown-motion-type
```

Event order:

```txt
onSkip
return skipped result
```

This is not emitted as `onError` because an unknown motion type is treated as a controlled skip result by `play()`.

### 4.3 Driver cancel not supported

When `motion.cancel(target)` is called and the driver does not expose a `cancel` method, the engine returns a skipped result.

Returned result:

```ts
{
  status: 'skipped',
  reason: 'driver-cancel-not-supported'
}
```

Event order:

```txt
onSkip
onCancel
return skipped result
```

Both events are useful here:

```txt
onSkip
  Explains that the control operation could not be executed.

onCancel
  Observes that a cancel request completed with a MotionPlaybackResult.
```

### 4.4 Driver finish not supported

When `motion.finish(target)` is called and the driver does not expose a `finish` method, the engine returns a skipped result.

Returned result:

```ts
{
  status: 'skipped',
  reason: 'driver-finish-not-supported'
}
```

Event order:

```txt
onSkip
return skipped result
```

### 4.5 Driver reset not supported

When `motion.reset(target)` is called and the driver does not expose a `reset` method, the engine returns a skipped result.

Returned result:

```ts
{
  status: 'skipped',
  reason: 'driver-reset-not-supported'
}
```

Event order:

```txt
onSkip
return skipped result
```

## 5. Cases that are not `onSkip`

Invalid timelines are not skipped.

They are planning failures.

Example:

```txt
invalid direct timeline
  -> MotionPlanningError
  -> onError during playTimeline(...)
  -> failed MotionPlaybackResult
```

So the separation is:

```txt
motion disabled
  -> onSkip

unknown registered motion type
  -> onSkip

unsupported driver control operation
  -> onSkip

invalid timeline
  -> onError

invalid motion options
  -> onError during play(...)
```

This distinction keeps the event model clean.

## 6. Recommended usage

### 6.1 Debug logging

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onSkip(event) {
      console.debug('[motion] skipped', event.reason, event.motionType);
    }
  }
});
```

### 6.2 Visual builder diagnostics

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onSkip(event) {
      builderDiagnostics.add({
        level: 'info',
        message: `Motion skipped: ${event.reason}`,
        motionType: event.motionType
      });
    }
  }
});
```

### 6.3 Analytics

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onSkip(event) {
      analytics.track('motion_skipped', {
        reason: event.reason,
        source: event.source,
        motionType: event.motionType
      });
    }
  }
});
```

If analytics code can throw, wrap it in `try/catch`. Event listener errors are not currently isolated by the engine.

## 7. Exact optional property rule

The project uses strict optional property behavior.

Rule:

```txt
Optional event properties must be omitted when they do not exist.
Do not set them to explicit undefined.
```

Correct:

```ts
{
  type: 'skip',
  reason: 'driver-reset-not-supported',
  result,
  target,
  timestamp: Date.now()
}
```

Avoid:

```ts
{
  type: 'skip',
  reason: 'driver-reset-not-supported',
  result,
  target,
  source: undefined,
  motionId: undefined,
  motionType: undefined,
  timestamp: Date.now()
}
```

## 8. Testing coverage

The current implementation should be covered by tests for:

```txt
- disabled registered motion emits onSkip
- unknown registered motion type emits onSkip
- unsupported cancel emits onSkip
- unsupported finish emits onSkip
- unsupported reset emits onSkip
```

Expected event orders:

```txt
motion-disabled
  onSkip

unknown-motion-type
  onSkip

driver-cancel-not-supported
  onSkip -> onCancel

driver-finish-not-supported
  onSkip

driver-reset-not-supported
  onSkip
```

## 9. Future improvements

Potential future additions:

```txt
- source information for more control operations when controller ownership is tracked
- skipped createPlayback/createTimelinePlayback fallback reasons
- dynamic motion.on('skip', listener) subscription API
- optional eventErrorStrategy for listener failures
```

Those features are not implemented yet.

## 10. Documentation status

`onSkip` is now implemented and should no longer be listed as a missing engine event.

Current event callbacks:

```txt
onBeforePlan
onPlan
onPlay
onFinish
onCancel
onSkip
onError
```
