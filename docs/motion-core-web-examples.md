# Structifyx Motion Engine - Motion Core + Web Examples

> Status: developer-facing examples guide.
> Scope: practical browser examples using `@structifyx/motion-core`, `@structifyx/motion-web`, and optionally `@structifyx/motion-pack-basic`.
> Rule: every example in this document is based on APIs and behavior present in the current codebase.
> Last aligned state: after `5880634 fix(web): skip finish for infinite playback controllers`.

## 1. Purpose

This guide shows how to combine the core engine and the Web driver in browser scenarios.

It is a companion to:

```txt
docs/web-driver-quickstart.md
docs/engine-events-api.md
docs/skip-event-api.md
docs/playback-controller-behavior.md
```

The goal is to provide small, focused examples that help developers test and understand the current engine behavior.

Important scope decision:

```txt
examples/vanilla should stay simple for now.
It should test the engine, not become a full visual animation builder yet.
```

A future visual lab can be designed later, after the public documentation and extension guides are stronger.

## 2. Audited API surface

The examples use the following verified public APIs:

```ts
import {
  createMotionEngine,
  createMotionTimeline,
  DefaultMotionRegistry
} from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
import { WebMotionDriver } from '@structifyx/motion-web';
```

The Web driver works with DOM `Element` targets.

```ts
const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver()
});
```

`motion-pack-basic` currently registers:

```txt
fade-in
fade-out
slide-in
```

## 3. Shared setup

Most examples can share this setup.

HTML:

```html
<section id="demoCard">
  <h2 data-motion-child="title">Motion card</h2>
  <p class="description">This card is animated by Structifyx Motion Engine.</p>
</section>

<div data-motion-name="globalToast">Saved successfully</div>
```

TypeScript:

```ts
import {
  createMotionEngine,
  createMotionTimeline,
  DefaultMotionRegistry
} from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
import { WebMotionDriver } from '@structifyx/motion-web';

const card = document.getElementById('demoCard');

if (!card) {
  throw new Error('Missing #demoCard element.');
}

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }),
  registry,
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

Why an explicit registry is used:

```txt
registerBasicMotions(registry) needs a MotionRegistry instance.
createMotionEngine() creates a hidden default registry only when none is provided.
So registered pack motions should use an explicit DefaultMotionRegistry.
```

## 4. Example 1 - Direct fade timeline

This example does not use a registered motion. It builds a timeline directly.

```ts
const fadeTimeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(card, fadeTimeline);
```

Expected engine flow:

```txt
playTimeline
  -> before-plan
  -> plan
  -> play
  -> WebMotionDriver.play
  -> finish
```

This is useful for custom one-off animations that should not be registered as reusable motion definitions.

## 5. Example 2 - Direct transform timeline

This example uses structured transform values.

```ts
const enterTimeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 420 }, (step) => {
      step.from({
        opacity: 0,
        transform: {
          y: 32,
          scale: 0.96
        }
      });

      step.to({
        opacity: 1,
        transform: {
          y: 0,
          scale: 1
        }
      });
    });
  });
});

await motion.playTimeline(card, enterTimeline);
```

The Web keyframe converter maps numeric length values to `px` and numeric angle values to `deg`.

So `y: 32` becomes a Web transform using `32px`.

## 6. Example 3 - Registered fade-in

This example uses the `fade-in` motion from `motion-pack-basic`.

```ts
await motion.play(card, {
  id: 'card-fade-in',
  type: 'fade-in',
  duration: 300,
  easing: 'ease-out',
  options: {
    fromOpacity: 0,
    toOpacity: 1
  }
});
```

Current `fade-in` options:

```txt
fromOpacity: number between 0 and 1, default 0
toOpacity: number between 0 and 1, default 1
```

The motion validates that `fromOpacity` and `toOpacity` are different.

## 7. Example 4 - Registered slide-in

This example uses the `slide-in` motion from `motion-pack-basic`.

```ts
await motion.play(card, {
  id: 'card-slide-in',
  type: 'slide-in',
  duration: 500,
  easing: {
    type: 'cubicBezier',
    x1: 0.22,
    y1: 1,
    x2: 0.36,
    y2: 1
  },
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

Current `slide-in` options:

```txt
direction: left | right | top | bottom, default bottom
distance: number between 0 and 300, default 24
fade: boolean, default true
```

The current implementation builds a transform string such as `translateY(56px)` and returns to `translate3d(0, 0, 0)`.

## 8. Example 5 - Multi-target timeline

The Web driver supports several target types.

```ts
const multiTargetTimeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 260 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });

  timeline.track({ type: 'child', name: 'title' }, (track) => {
    track.step({ duration: 320 }, (step) => {
      step.from({ transform: { y: 16 } });
      step.to({ transform: { y: 0 } });
    });
  });

  timeline.track({ type: 'selector', selector: '.description' }, (track) => {
    track.step({ duration: 320 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(card, multiTargetTimeline);
```

Current Web target resolution:

```txt
self
  Root element passed to play/playTimeline.

child
  root.querySelector('[data-motion-child="name"]').

selector
  root.querySelectorAll(selector).

named
  document.querySelector('[data-motion-name="name"]').
```

If any track resolves no target, playback fails with reason `target-not-found`.

## 9. Example 6 - Named global target

A `named` target is resolved from `document`, not from the root element.

```ts
const toastTimeline = createMotionTimeline((timeline) => {
  timeline.track({ type: 'named', name: 'globalToast' }, (track) => {
    track.step({ duration: 180 }, (step) => {
      step.from({ opacity: 0, transform: { y: 12 } });
      step.to({ opacity: 1, transform: { y: 0 } });
    });
  });
});

await motion.playTimeline(card, toastTimeline);
```

Required HTML:

```html
<div data-motion-name="globalToast">Saved successfully</div>
```

## 10. Example 7 - Reduced motion skip

The Web driver receives reduced motion from the application.

```ts
const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }),
  registry
});
```

A registered motion can request reduced motion handling:

```ts
await motion.play(card, {
  id: 'reduced-slide',
  type: 'slide-in',
  respectReducedMotion: true,
  reducedMotionStrategy: 'skip',
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

If reduced motion is active and strategy is `skip`, the Web driver returns a skipped result with reason:

```txt
reduced-motion
```

This skip comes from the Web driver playback result. It is different from the core `onSkip` event, which currently covers controlled engine-level skipped results such as disabled motions, unknown motion types and unsupported driver control operations.

## 11. Example 8 - Reduced motion simplify

`slide-in` currently provides a reduced motion timeline.

```ts
await motion.play(card, {
  id: 'simplified-slide',
  type: 'slide-in',
  duration: 500,
  respectReducedMotion: true,
  reducedMotionStrategy: 'simplify',
  options: {
    direction: 'bottom',
    distance: 72,
    fade: true
  }
});
```

When reduced motion is active and strategy is `simplify`, the Web driver uses:

```txt
1. executionPlan.reducedMotionTimeline when available
2. play options reducedMotionTimeline when available
3. generic simplified Web timeline otherwise
```

The generic simplified Web timeline keeps opacity and offset, caps duration at 150ms, sets delay to 0 and uses `ease-out`.

## 12. Example 9 - Conflict strategy ignore

The Web driver can detect active animations on resolved targets.

```ts
await motion.playTimeline(card, enterTimeline, {
  conflictStrategy: 'ignore'
});
```

Current behavior:

```txt
conflictStrategy = ignore + active Web animation exists
  -> skipped result with reason motion-conflict-ignored
```

This is useful for UI cases where a repeated click should not restart an already running animation.

## 13. Example 10 - Conflict strategy replace

```ts
await motion.playTimeline(card, enterTimeline, {
  conflictStrategy: 'replace'
});
```

Current behavior:

```txt
conflictStrategy = replace
  -> Web driver cancels existing animations on resolved targets before creating new animations
```

Important Web driver option:

```ts
const driver = new WebMotionDriver({
  cancelPreviousAnimations: false
});
```

When `cancelPreviousAnimations` is false and the engine conflict strategy is `replace`, the Web driver treats it as `parallel`.

## 14. Example 11 - Controlled playback

The Web driver implements `createPlayback()`, so the engine can create playback controllers.

```ts
const playback = motion.createTimelinePlayback(card, enterTimeline);

await playback.pause();
await playback.resume();
await playback.finish();
await playback.cancel();
playback.dispose();
```

Controller events are separate from global engine events.

The current vanilla example listens to controller events such as:

```txt
pause
resume
cancel
finish
skip
fail
statusChange
```

## 15. Example 12 - Infinite yoyo controlled playback

This is the most important current `examples/vanilla` scenario.

```ts
const infiniteYoyoTimeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step(
      {
        duration: 500,
        iterations: 'infinite',
        yoyo: true
      },
      (step) => {
        step.from({ transform: { x: -20 } });
        step.to({ transform: { x: 20 } });
      }
    );
  });
});

const playback = motion.createTimelinePlayback(card, infiniteYoyoTimeline);
```

Valid timing shape:

```ts
{
  iterations: 'infinite',
  yoyo: true
}
```

Invalid timing shape:

```ts
{
  iterations: 'infinite',
  yoyo: true,
  direction: 'alternate'
}
```

Reason:

```txt
yoyo: true already expresses alternate playback semantics.
Combining it with direction creates ambiguous timing semantics.
```

For infinite animations, use `cancel()` or engine `reset()` to stop the animation.

## 16. Example 13 - finish() on infinite Web playback

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

Important behavior:

```txt
- animation.finish() is not called
- the controller does not move to failed
- the controller keeps its previous running or paused status
- pause/resume/cancel remain usable after the skipped finish attempt
```

## 17. Example 14 - Global engine events log

```ts
const events: string[] = [];

const motion = createMotionEngine<Element>({
  driver: new WebMotionDriver(),
  registry,
  events: {
    onBeforePlan(event) {
      events.push(`before-plan:${event.source}`);
    },
    onPlan(event) {
      events.push(`plan:${event.source}:${event.plan.summary.totalTracks}`);
    },
    onPlay(event) {
      events.push(`play:${event.source}`);
    },
    onFinish(event) {
      events.push(`finish:${event.result.status}`);
    },
    onCancel(event) {
      events.push(`cancel:${event.result.status}`);
    },
    onSkip(event) {
      events.push(`skip:${event.reason}`);
    },
    onError(event) {
      events.push(`error:${event.source}`);
      console.error(event.error);
    }
  }
});
```

Expected successful registered motion order:

```txt
before-plan:registered-motion
plan:registered-motion:...
play:registered-motion
finish:finished
```

Expected successful direct timeline order:

```txt
before-plan:direct-timeline
plan:direct-timeline:...
play:direct-timeline
finish:finished
```

## 18. Example 15 - Disabled registered motion

```ts
const result = await motion.play(card, {
  id: 'disabled-fade',
  type: 'fade-in',
  enabled: false
});
```

Expected result:

```ts
{
  status: 'skipped',
  reason: 'motion-disabled'
}
```

Expected global event:

```txt
onSkip
```

No planning event should be emitted because the engine does not enter planning for disabled motions.

## 19. Example 16 - Unknown registered motion

```ts
const result = await motion.play(card, {
  id: 'unknown-motion-demo',
  type: 'unknown-motion'
});
```

Expected result:

```ts
{
  status: 'skipped',
  reason: 'unknown-motion-type'
}
```

Expected global event:

```txt
onSkip
```

This is not treated as `onError` by `play()`.

## 20. Example 17 - Target not found

```ts
const missingTargetTimeline = createMotionTimeline((timeline) => {
  timeline.track({ type: 'child', name: 'missing' }, (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

const result = await motion.playTimeline(card, missingTargetTimeline);
```

Expected Web playback result:

```txt
status = failed
reason = target-not-found
```

This failure is produced by the Web driver target resolution phase.

## 21. Current recommended examples/vanilla scope

The current `examples/vanilla` app should stay focused on a small manual test surface:

```txt
1. iterations: 'infinite'
2. yoyo: true
3. createTimelinePlayback()
4. pause
5. resume
6. finish on infinite -> skipped, not failed
7. cancel
8. reset
9. controller events
10. last MotionPlaybackResult display
```

Do not turn this example into a complete visual builder yet.

Future examples can be added as small, separate sections or cookbook pages instead of one large UI refactor.

## 22. Future cookbook ideas

Useful future docs or small example pages:

```txt
- direct timeline cookbook
- registered motion cookbook
- reduced motion cookbook
- conflict strategy cookbook
- playback controller cookbook
- target resolution cookbook
- engine events debugging cookbook
```

Those should demonstrate existing behavior and avoid introducing new engine APIs.

## 23. Validation commands

Before committing changes to the example app:

```bash
pnpm format
pnpm build
pnpm typecheck
pnpm -r --workspace-concurrency=1 test
```

For local browser testing:

```bash
pnpm --filter @structifyx/motion-example-vanilla dev
```

Manual vanilla checks:

```txt
1. Create infinite/yoyo controller.
2. Pause -> status becomes paused.
3. Resume -> status becomes running.
4. Finish -> returns skipped, not failed.
5. After skipped finish, pause/resume/cancel should still work.
6. Cancel -> status becomes cancelled.
7. Reset -> visual state is cleaned.
```
