# Writing a Custom MotionDriver

> Status: current guide.
> Scope: `@tiqlyne/motion-core` driver contract and platform adapter design.
> Audience: developers who want to execute Tiqlyne Motion timelines outside the Web driver.

## 1. What a driver is

A `MotionDriver` is the platform execution adapter.

It receives a `MotionTimelineDefinition` already produced, validated, prepared and scheduled by `motion-core`, then translates it to a concrete runtime.

```txt
MotionDefinition / MotionCompositionDefinition / MotionTimelineDefinition
  -> motion-core planning pipeline
  -> MotionExecutionPlan
  -> MotionDriver.play(target, timeline, options)
```

A driver is not a reusable animation effect.

```txt
MotionDefinition
  Describes what to animate.
  Example: fade-in, slide-in, scale-in.

MotionDriver
  Describes how to execute a timeline on a platform.
  Example: Web Animations API, Canvas, React Native, terminal, game engine.
```

The same motion can run on multiple drivers if the driver understands the generated timeline fields.

## 2. Current driver contract audit

The public contract is intentionally small.

```ts
export interface MotionDriver<TTarget = unknown> {
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
    options: MotionCreatePlaybackOptions
  ): MotionPlaybackController;
}
```

Required:

```txt
name
play()
```

Optional:

```txt
cancel()
finish()
reset()
createPlayback()
```

The generic `TTarget` is the platform target type.

Examples:

```txt
WebMotionDriver<Element>
CanvasMotionDriver<CanvasObject>
ReactNativeMotionDriver<ReactNativeMotionTarget>
ConsoleMotionDriver<string>
GameMotionDriver<GameEntity>
```

This is the main extensibility point: `motion-core` does not know what the target really is.

## 3. What play() receives

`play()` receives:

```ts
target: TTarget;
timeline: MotionTimelineDefinition;
options: MotionPlayOptions;
```

`MotionPlayOptions` contains runtime decisions already normalized by the engine:

```txt
trigger
respectReducedMotion
reducedMotionStrategy
reducedMotionTimeline
conflictStrategy
executionPlan
timelineValidated
reducedMotionTimelineValidated
```

Important fields:

```txt
respectReducedMotion
  Whether reduced motion should be considered.

reducedMotionStrategy
  How to handle reduced motion: skip, simplify, preserve.

reducedMotionTimeline
  Optional alternate timeline.

conflictStrategy
  How to react when there is already active playback on the same target.

executionPlan
  Full planned output from the core: original timeline, prepared timeline, scheduled timeline, summary and diagnostics.

timelineValidated
  Tells advanced drivers that core validation already happened.
```

For simple drivers, using only `timeline` is enough.

For serious drivers, prefer `options.executionPlan.scheduledTimeline.tasks` when available.

## 4. Recommended driver levels

### 4.1 Passive/debug driver

A passive driver logs or records calls.

Use cases:

```txt
debugging
unit tests
server-side preview
AI generated timeline inspection
snapshot tests
```

It does not animate anything.

### 4.2 Simple immediate driver

A simple immediate driver applies the final keyframe instantly or simulates completion.

Use cases:

```txt
terminal demos
non-visual environments
state-based UI updates
reduced-motion experiments
```

### 4.3 Scheduled runtime driver

A scheduled runtime driver reads `executionPlan.scheduledTimeline.tasks` and executes each task at the planned time.

Use cases:

```txt
Canvas
SVG runtime without WAAPI
React Native Animated/Reanimated
Game engines
custom render loops
```

### 4.4 Controlled playback driver

A controlled playback driver implements `createPlayback()` and returns a `MotionPlaybackController`.

Use cases:

```txt
pause
resume
cancel
finish
dispose
animation editor timeline preview
```

## 5. Minimal ConsoleMotionDriver

This driver is useful for debugging and for understanding the contract.

```ts
import type {
  MotionDriver,
  MotionPlayOptions,
  MotionPlaybackResult,
  MotionTimelineDefinition
} from '@tiqlyne/motion-core';

export class ConsoleMotionDriver<TTarget = unknown> implements MotionDriver<TTarget> {
  readonly name = 'console';

  async play(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options: MotionPlayOptions
  ): Promise<MotionPlaybackResult> {
    console.log('Motion target:', target);
    console.log('Motion timeline:', timeline);
    console.log('Motion options:', options);

    return { status: 'finished' };
  }

  async cancel(_target: TTarget): Promise<MotionPlaybackResult> {
    return {
      status: 'skipped',
      reason: 'console-driver-cancel-not-supported'
    };
  }
}
```

Usage:

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';

const motion = createMotionEngine<string>({
  driver: new ConsoleMotionDriver()
});

await motion.playTimeline('hero-card', {
  tracks: [
    {
      target: { type: 'self' },
      steps: [
        {
          duration: 300,
          keyframes: [{ opacity: 0 }, { opacity: 1 }]
        }
      ]
    }
  ]
});
```

Here the engine target is a string, not a DOM element.

## 6. Test/recording driver pattern

A test driver records calls instead of executing animations.

This pattern is excellent for package authors.

It lets tests assert:

```txt
the engine called the driver
the correct target was passed
the timeline was compiled correctly
the execution options were normalized
the execution plan was attached
```

A recording driver should usually expose:

```txt
getCalls()
getControlCalls()
clear()
```

The current `TestMotionDriver` in `motion-core` follows this pattern.

## 7. Scheduled driver pattern

For real animation runtimes, use the scheduled timeline.

The execution plan contains:

```txt
timeline
preparedTimeline
scheduledTimeline
reducedMotionTimeline
preparedReducedMotionTimeline
scheduledReducedMotionTimeline
summary
diagnostics
```

The scheduled timeline contains tasks:

```txt
taskIndex
trackIndex
stepIndex
startTime
endTime
duration
delay
step
```

Each prepared step already contains:

```txt
startTime
endTime
duration
delay
keyframes
easing
fill
iterations
direction
yoyo
endDelay
activeDuration
playbackRate
source
```

So the driver does not need to resolve labels, anchors or default durations itself.

Recommended flow:

```txt
1. Read options.executionPlan.
2. Choose the active scheduled timeline.
3. Resolve track targets for the platform.
4. Convert each scheduled task to platform animation instructions.
5. Start the platform animation runtime.
6. Return finished, running, skipped or failed.
```

## 8. Canvas driver concept

Canvas has no DOM animation engine.

A Canvas driver usually needs:

```txt
Canvas target object
render loop
keyframe interpolation
active playback registry
cancel / finish / reset behavior
```

Possible target shape:

```ts
type CanvasMotionTarget = {
  readonly id: string;
  x: number;
  y: number;
  opacity: number;
  rotation: number;
};
```

Driver flow:

```txt
1. Read scheduled tasks from options.executionPlan.scheduledTimeline.
2. For each task, interpolate keyframes over time.
3. Mutate the canvas target object.
4. Ask the renderer to redraw.
5. Resolve finished when all tasks complete.
```

A first version can apply the final keyframe immediately. A production version should use `requestAnimationFrame` or the platform render loop.

## 9. React Native driver concept

React Native would use a different target and map core keyframes to `Animated` or Reanimated.

Example target shape:

```ts
type ReactNativeMotionTarget = {
  readonly id: string;
  readonly animatedValues: Record<string, unknown>;
};
```

Possible mapping:

```txt
opacity -> animated value
translateX / translateY -> transform animated values
scale -> transform animated values
rotate -> transform animated value
```

Driver flow:

```txt
1. Read scheduled tasks from options.executionPlan.
2. Resolve each task keyframes to platform animated values.
3. Convert duration, delay and easing.
4. Start Animated or Reanimated animations.
5. Track active animations for cancel/finish/reset.
6. Return a controller if createPlayback() is implemented.
```

Do not put React Native imports in `motion-core`.

A React Native driver must live in a separate package, for example:

```txt
packages/motion-react-native
```

## 10. Reduced motion in a custom driver

A custom driver should respect:

```txt
options.respectReducedMotion
options.reducedMotionStrategy
options.reducedMotionTimeline
options.executionPlan?.scheduledReducedMotionTimeline
```

Recommended behavior:

```txt
respectReducedMotion = false
  Run the normal timeline.

respectReducedMotion = true + reducedMotionStrategy = skip
  Return { status: 'skipped', reason: 'reduced-motion' }.

respectReducedMotion = true + reducedMotionStrategy = simplify
  Prefer the reduced motion timeline or scheduled reduced motion timeline.

respectReducedMotion = true + reducedMotionStrategy = preserve
  Run the normal timeline, possibly with diagnostics.
```

The Web driver is the current reference implementation for this behavior.

## 11. Conflict strategy in a custom driver

The engine passes `options.conflictStrategy`.

A driver should decide how to handle active animations for the same target.

Expected meanings:

```txt
ignore
  If the target already has active playback, skip the new playback.

replace
  Cancel active playback on the target, then start the new playback.

parallel
  Allow both playbacks to run.
```

A driver needs its own active playback registry if the platform does not provide one.

## 12. Returning playback results

Use `finished` when playback completes successfully.

```ts
return { status: 'finished' };
```

Use `cancelled` when a cancellation was performed.

```ts
return {
  status: 'cancelled',
  reason: 'canvas-driver-cancel'
};
```

Use `skipped` for controlled non-errors.

```ts
return {
  status: 'skipped',
  reason: 'canvas-driver-cancel-not-supported'
};
```

Use `failed` for actual execution failures.

```ts
return {
  status: 'failed',
  reason: 'canvas-driver-play-failed',
  error
};
```

Rule:

```txt
unsupported but expected => skipped
unexpected runtime error => failed
```

## 13. createPlayback() and controllers

`play()` is enough for basic execution.

Implement `createPlayback()` only when the platform can expose controls.

A `MotionPlaybackController` must provide:

```txt
id
status
disposed
finished
pause()
resume()
cancel()
finish()
on()
once()
dispose()
```

A simple package can reuse `PromiseMotionPlaybackController` from `motion-core` when playback is mostly promise-based.

A more advanced package should create a custom controller, like the Web driver does.

Recommended rule:

```txt
If you cannot pause/resume safely, do not expose fake pause/resume behavior.
Return skipped for unsupported controller operations.
```

## 14. What a driver should not do

A custom driver should not:

```txt
- import DOM, WAAPI, React or platform APIs into motion-core
- define reusable motion semantics such as fade-in or slide-in
- mutate MotionTimelineDefinition in place
- bypass core validation and scheduling without a reason
- treat invalid runtime data as skipped
- silently ignore unsupported keyframe properties
- invent global singletons unless the platform requires it
```

## 15. Recommended package structure

For a real driver package:

```txt
packages/motion-canvas/
  src/
    drivers/
      canvas-motion-driver.ts
    controllers/
      canvas-motion-playback-controller.ts
    utils/
      resolve-canvas-target.ts
      interpolate-keyframes.ts
      convert-easing.ts
      apply-canvas-keyframe.ts
    index.ts
    canvas-motion-driver.spec.ts
  package.json
  tsconfig.json
```

Keep the public package entry small:

```ts
export { CanvasMotionDriver } from './drivers/canvas-motion-driver';
export type { CanvasMotionDriverOptions, CanvasMotionTarget } from './drivers/canvas-motion-driver';
```

## 16. Testing checklist

A custom driver should test:

```txt
play() returns finished for a valid timeline
play() returns skipped for reduced motion skip
play() returns skipped for conflictStrategy ignore when active playback exists
play() replaces active playback for conflictStrategy replace
play() supports parallel when conflictStrategy parallel is selected
play() returns failed for missing/unresolvable targets
cancel() returns cancelled when active playback exists
cancel() returns skipped when there is nothing to cancel or cancel is unsupported
finish() handles infinite playback safely
reset() restores target state if supported
createPlayback() exposes controller lifecycle if implemented
```

For non-Web drivers, also test conversion boundaries:

```txt
unsupported keyframe properties
unsupported easing values
unsupported transform/filter values
zero duration
infinite iterations
playbackRate
```

## 17. Current audit conclusion

The current driver API is good for first-class platform adapters because:

```txt
- the contract is small
- target type is generic
- play() is required, controls are optional
- executionPlan exposes prepared and scheduled timelines
- reduced motion and conflict strategy are passed explicitly
- playback result statuses are generic enough for several platforms
```

Current limitations to keep in mind:

```txt
- no first-class driver capability declaration yet
- no driver-specific validation hook yet
- no standardized keyframe property support matrix yet
- no shared interpolation/easing runtime helper yet
- no generic active playback registry helper yet
- no generic non-Web controller base beyond promise-based control
```

These limitations are acceptable right now. The next implementation step should not change the core contract immediately. It should start with one small experimental driver package or example, then promote shared helpers only after repeated needs appear.

## 18. Recommended next implementation step

The best next code step is an experimental `motion-debug` driver.

Why:

```txt
small scope
no platform complexity
excellent for tests and docs
proves the driver package structure
safe before Canvas or React Native complexity
```

Suggested package:

```txt
packages/motion-debug
```

Suggested public API:

```ts
export class DebugMotionDriver<TTarget = unknown> implements MotionDriver<TTarget> {
  readonly name = 'debug';

  getCalls(): ReadonlyArray<DebugMotionDriverCall<TTarget>>;
  clear(): void;
}
```

After that, a `motion-canvas` package would be the best real non-Web driver proof of concept.
