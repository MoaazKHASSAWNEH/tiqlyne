# Structifyx Motion Engine - Web Driver Quickstart

> Status: developer-facing quickstart.
> Scope: using `@structifyx/motion-core` with `@structifyx/motion-web` in a browser environment.
> Rule: this document describes only APIs and behavior verified in the current codebase.
> Last verified state: after `5880634 fix(web): skip finish for infinite playback controllers`.

## 1. Audit summary

The Web package exports `WebMotionDriver` and `WebMotionDriverOptions` from `packages/motion-web/src/index.ts`.

`WebMotionDriver` implements the core `MotionDriver<Element>` contract. Its target type is `Element`, so Web usage should create an engine typed with `Element`:

```ts
const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver()
});
```

The current Web driver can:

```txt
- play a MotionTimelineDefinition on an Element
- create a WebMotionPlaybackController
- cancel animations on a target subtree
- finish finite animations on a target subtree
- reset animations on a target subtree
- resolve timeline targets to DOM elements
- translate motion keyframes to Web keyframes
- translate timing options to KeyframeAnimationOptions
- handle reduced motion behavior
- handle animation conflict behavior
- safely skip finish() on infinite playback controllers
```

## 2. Packages used

A browser integration normally uses:

```ts
import { createMotionEngine, createMotionTimeline } from '@structifyx/motion-core';
import { WebMotionDriver } from '@structifyx/motion-web';
```

If reusable basic motions are needed:

```ts
import { DefaultMotionRegistry } from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
```

## 3. Minimal direct timeline example

HTML:

```html
<div id="box">Hello</div>
<button id="play">Play</button>
```

TypeScript:

```ts
import { createMotionEngine, createMotionTimeline } from '@structifyx/motion-core';
import { WebMotionDriver } from '@structifyx/motion-web';

const target = document.getElementById('box');
const button = document.getElementById('play');

if (!target || !button) {
  throw new Error('Missing required elements.');
}

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});

const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({
        opacity: 0,
        transform: {
          y: 24
        }
      });

      step.to({
        opacity: 1,
        transform: {
          y: 0
        }
      });
    });
  });
});

button.addEventListener('click', () => {
  void motion.playTimeline(target, timeline);
});
```

Flow:

```txt
createMotionTimeline(...)
  -> MotionTimelineDefinition

motion.playTimeline(target, timeline)
  -> core applies defaults and validates
  -> core creates an execution plan
  -> WebMotionDriver resolves targets
  -> WebMotionDriver creates Web Animations API animations
```

## 4. WebMotionDriver options

Current options:

```ts
export type WebMotionDriverOptions = {
  readonly reducedMotion?: boolean;
  readonly cancelPreviousAnimations?: boolean;
};
```

Example:

```ts
const driver = new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  cancelPreviousAnimations: true
});
```

Meaning:

```txt
reducedMotion
  Boolean provided by the application.
  The driver does not read matchMedia by itself.

cancelPreviousAnimations
  Web-driver-level conflict option.
  When false and the engine conflict strategy is replace, the Web driver treats it as parallel.
```

## 5. Direct timeline with engine events

```ts
const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  events: {
    onBeforePlan(event) {
      console.debug('[motion] before-plan', event.source);
    },
    onPlan(event) {
      console.debug('[motion] plan', event.plan.summary);
    },
    onPlay(event) {
      console.debug('[motion] play', event.target);
    },
    onFinish(event) {
      console.debug('[motion] finish', event.result.status);
    },
    onSkip(event) {
      console.debug('[motion] skip', event.reason);
    },
    onError(event) {
      console.error('[motion] error', event.error);
    }
  }
});
```

For successful direct timeline playback, the expected engine event order is:

```txt
onBeforePlan
onPlan
onPlay
onFinish
```

`onSkip` is not normally emitted by `playTimeline()` for invalid timelines. Invalid timelines are planning errors and are observed through `onError` when using `playTimeline()`.

## 6. Registered motion example with motion-pack-basic

`@structifyx/motion-pack-basic` exports `registerBasicMotions(registry)`.

That helper registers the current basic motion definitions:

```txt
fade-in
fade-out
slide-in
```

Because `createMotionEngine()` creates a default registry internally, the pack registration helper needs an explicit registry object.

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
import { WebMotionDriver } from '@structifyx/motion-web';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  registry,
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

Then play a registered motion:

```ts
await motion.play(element, {
  id: 'hero-slide-in',
  type: 'slide-in',
  duration: 500,
  easing: 'ease-out',
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

## 7. Target resolution on the Web

The core does not resolve real DOM elements. The Web driver resolves track targets.

Supported target behavior:

```txt
self
  Resolves to the root Element passed to play/playTimeline.

child
  Uses root.querySelector('[data-motion-child="name"]').

selector
  Uses root.querySelectorAll(selector).

named
  Uses document.querySelector('[data-motion-name="name"]').
```

If a track target cannot be resolved, the Web driver returns a failed playback result with reason:

```txt
target-not-found
```

## 8. Keyframe conversion

The Web driver translates motion keyframes to Web keyframes.

Currently handled keyframe fields:

```txt
opacity
transform
filter
backgroundColor
color
borderColor
boxShadow
outlineColor
offset
custom
```

Transform conversion details:

```txt
number length values -> px
number angle values  -> deg
string values        -> passed through
```

Example:

```ts
step.from({
  opacity: 0,
  transform: {
    x: 24,
    rotate: 6
  }
});
```

The transform is converted conceptually to:

```txt
translateX(24px) rotate(6deg)
```

## 9. Timing conversion

The Web driver maps motion timing to `KeyframeAnimationOptions`.

Current mapping:

```txt
duration
delay
easing
fill
iterations
direction
yoyo
endDelay
playbackRate
```

Important details:

```txt
- default duration is 0 when a step has no duration after defaults
- default delay is 0
- default easing is ease
- default fill is both
- iterations: 'infinite' maps to Infinity
- yoyo: true maps direction to alternate
- scheduled task delay uses task.startTime
```

Validation rule:

```txt
yoyo: true cannot be used together with direction.
```

Valid:

```ts
{
  iterations: 'infinite',
  yoyo: true
}
```

Valid:

```ts
{
  iterations: 'infinite',
  direction: 'alternate'
}
```

Invalid:

```ts
{
  iterations: 'infinite',
  yoyo: true,
  direction: 'alternate'
}
```

## 10. Infinite playback behavior

When a direct timeline is infinite, `playTimeline()` does not wait forever.

Expected result:

```json
{
  "status": "running",
  "reason": "web-playback-infinite"
}
```

This means the animation was started successfully and remains active.

For manual control, use a controller:

```ts
const playback = motion.createTimelinePlayback(element, infiniteTimeline);
```

Then use:

```ts
await playback.pause();
await playback.resume();
await playback.cancel();
```

For infinite animations, `cancel()` or engine `reset()` is the recommended way to stop the animation.

## 11. Reduced motion behavior

The Web driver receives reduced motion as a boolean option:

```ts
new WebMotionDriver({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
```

Reduced motion only applies when play options also respect reduced motion.

Current behavior:

```txt
reducedMotion = true + reducedMotionStrategy = skip
  -> Web driver returns skipped result with reason reduced-motion

reducedMotion = true + reducedMotionStrategy = simplify
  -> Web driver uses the execution plan reducedMotionTimeline when available
  -> otherwise uses the play options reducedMotionTimeline when available
  -> otherwise creates a generic simplified Web timeline
```

The generic simplified Web timeline currently:

```txt
- keeps opacity and offset values
- removes transform/filter/paint-heavy data from keyframes
- caps duration at 150ms
- uses delay 0
- uses easing ease-out
- keeps fill from step, track defaults, timeline defaults, or both
```

## 12. Conflict behavior

Current behavior:

```txt
conflictStrategy = ignore + active animation exists
  -> skipped result with reason motion-conflict-ignored

conflictStrategy = replace
  -> cancel existing animations on resolved targets before creating new animations

WebMotionDriver option cancelPreviousAnimations = false
  -> if engine conflictStrategy is replace, Web driver treats it as parallel
```

The Web driver considers an animation active when its play state is running or paused, or when it is pending.

## 13. Playback controllers

The Web driver implements `createPlayback()`.

The engine can create a controller:

```ts
const playback = motion.createTimelinePlayback(element, timeline);

await playback.pause();
await playback.resume();
await playback.finish();
await playback.cancel();
playback.dispose();
```

Controller events:

```txt
start
statusChange
pause
resume
cancel
finish
skip
fail
```

This is controller-level playback event behavior, separate from global engine events.

### 13.1 `finish()` on finite animations

For finite animations, `finish()` calls WAAPI `animation.finish()` and returns:

```json
{
  "status": "finished",
  "reason": "web-playback-finish"
}
```

### 13.2 `finish()` on infinite animations

WAAPI cannot safely finish an infinite animation. Browsers can throw an `InvalidStateError` if `animation.finish()` is called on an infinite animation.

The Web controller detects infinite animations first and returns a controlled skipped result:

```json
{
  "status": "skipped",
  "reason": "web-playback-finish-not-supported-for-infinite-animation",
  "diagnostics": [
    {
      "level": "warning",
      "code": "web-playback-finish-not-supported-for-infinite-animation",
      "message": "Web playback cannot finish an infinite animation. Use cancel() or reset() instead.",
      "source": "web-motion-playback-controller"
    }
  ]
}
```

Important: this does not put the controller in `failed`. The controller keeps its previous status, so `pause`, `resume` or `cancel` can still be used.

For full controller behavior:

```txt
docs/playback-controller-behavior.md
```

## 14. Current limitations and careful points

```txt
- WebMotionDriver works with Element targets, not arbitrary objects.
- The driver uses browser APIs such as Element.animate(), getAnimations(), querySelector() and querySelectorAll().
- The driver does not read prefers-reduced-motion by itself.
- The application must pass reducedMotion into WebMotionDriverOptions.
- Missing track targets fail playback with target-not-found.
- The current pack registration helper requires an explicit registry object.
- Global engine events and playback controller events are separate systems.
- Dynamic engine event subscriptions through motion.on(...) are not implemented yet.
- A full visual animation builder is not implemented yet.
```

## 15. Validation commands

From the repository root:

```bash
pnpm format
pnpm build
pnpm typecheck
pnpm -r --workspace-concurrency=1 test
```

For the vanilla browser example:

```bash
pnpm --filter @structifyx/motion-example-vanilla dev
```

Manual vanilla checks:

```txt
1. Create infinite/yoyo controller.
2. Pause.
3. Resume.
4. Finish -> should return skipped, not failed.
5. After skipped finish, pause/resume/cancel should still work.
6. Cancel.
7. Reset.
```
