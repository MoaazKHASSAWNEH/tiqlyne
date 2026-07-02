# Structifyx Motion Engine - Complete Usage Guide

> Status: complete developer usage guide for the current V1 pre-release state.
> Scope: public usage of `@structifyx/motion-core`, `@structifyx/motion-web` and `@structifyx/motion-pack-basic`.
> Last verified state: after `77f3beb docs(core): add tsdoc to engine factory and base definitions`.

## 1. What this engine does

Structifyx Motion Engine lets developers describe, compose, validate, inspect and play animations through a platform-neutral TypeScript API.

The core package does not execute DOM animations directly. It creates timelines and execution plans. A driver executes those plans on a specific platform.

```txt
motion-core = contracts, models, validation, planning, scheduling, diagnostics, sampler, inspector, composition
motion-web = Web Animations API execution for the browser
motion-pack-basic = reusable motion definitions such as fade-in, fade-out and slide-in
```

## 2. Installation model

The repository is currently a pnpm monorepo. Packages are versioned at `0.1.0` and the root project is still private.

Expected future install shape:

```bash
pnpm add @structifyx/motion-core @structifyx/motion-web @structifyx/motion-pack-basic
```

Until publication, use workspace packages inside the monorepo.

## 3. The main mental model

The engine supports three authoring inputs:

```txt
1. MotionConfig
   References a registered MotionDefinition by type.

2. MotionTimelineDefinition
   Direct serializable runtime timeline.

3. MotionCompositionDefinition
   Authoring/orchestration model that compiles to MotionTimelineDefinition.
```

Execution pipeline:

```txt
MotionConfig / MotionCompositionDefinition / MotionTimelineDefinition
  -> normalize or compile
  -> apply defaults
  -> validate
  -> prepare timeline
  -> schedule tasks
  -> create execution plan
  -> driver executes plan
  -> result/controller/events/diagnostics
```

## 4. Creating a Web engine

Typical browser usage combines `motion-core`, `motion-web` and optionally `motion-pack-basic`.

```ts
import { createMotionEngine } from '@structifyx/motion-core';
import { WebMotionDriver } from '@structifyx/motion-web';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';

const motion = createMotionEngine({
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});

registerBasicMotions(motion);
```

If no registry or normalizer is provided, `createMotionEngine()` creates default implementations.

## 5. Playing a registered motion

Registered motions are reusable definitions referenced by `type`.

```ts
await motion.play(element, {
  id: 'hero-enter',
  type: 'slide-in',
  trigger: 'onEnter',
  duration: 400,
  options: {
    direction: 'bottom',
    distance: 48,
    fade: true
  }
});
```

Important fields on `MotionConfig`:

```txt
id: stable config id
type: registered motion type
trigger: optional trigger, for example onEnter
enabled: false skips playback
duration: preferred duration in ms
delay: preferred delay in ms
easing: preferred easing
options: raw options for the registered motion
respectReducedMotion: reduced-motion behavior flag
reducedMotionStrategy: skip, simplify or preserve
conflictStrategy: ignore, replace or parallel
priority: orchestration priority
metadata: app-specific metadata
```

## 6. Creating a direct timeline

Use `createMotionTimeline()` when you want explicit control over tracks and steps.

```ts
import { createMotionTimeline } from '@structifyx/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  });

  timeline.label('start', 0);
  timeline.label('visible', 300);

  timeline.track('self', (track) => {
    track.step({ at: 0 }, (step) => {
      step.from({ opacity: 0, transform: 'translateY(16px)' });
      step.to({ opacity: 1, transform: 'translateY(0)' });
    });
  });
});

await motion.playTimeline(element, timeline);
```

The builder returns a plain `MotionTimelineDefinition`. The serializable object remains the source of truth.

## 7. Timeline targets

`motion-core` stores target references. Drivers resolve them.

Supported target references:

```txt
self
child:name
selector:CSS selector
named:name
```

Builder shorthand examples:

```ts
timeline.track('self', (track) => {});
timeline.track({ type: 'selector', selector: '.card' }, (track) => {});
timeline.track({ type: 'named', name: 'hero-title' }, (track) => {});
```

In the Web driver, targets are resolved against DOM elements.

## 8. Defaults priority

Defaults are resolved from broadest to most specific. The most local value wins.

```txt
step value
  > track defaults
  > timeline defaults
  > engine defaults
  > core defaults
```

Example:

```ts
const motion = createMotionEngine({
  driver,
  defaults: {
    duration: 500,
    easing: 'ease-out'
  }
});

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({ duration: 300 });

  timeline.track('self', (track) => {
    track.step({ duration: 100 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

Resolved duration is `100` because step-level duration wins.

## 9. Labels and positions

Labels are named timeline positions in milliseconds.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.label('intro', 0);
  timeline.label('content', 500);

  timeline.track('self', (track) => {
    track.step({ at: { label: 'content', offset: 100 } }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

Step positions may be:

```txt
number: absolute time in ms
string: shorthand label depending on API support
{ label, offset? }: label position
{ anchor, offset? }: track-start, track-end, previous-start, previous-end
```

## 10. Stagger

Stagger applies when a track resolves to multiple targets.

```ts
timeline.track({ type: 'selector', selector: '.card' }, (track) => {
  track.stagger({ each: 80, from: 'start' });

  track.step((step) => {
    step.from({ opacity: 0, transform: 'translateY(12px)' });
    step.to({ opacity: 1, transform: 'translateY(0)' });
  });
});
```

Supported stagger origins:

```txt
start
end
center
```

## 11. Playback controllers

Use a playback controller when you need runtime control.

```ts
const controller = motion.createTimelinePlayback(element, timeline);

controller.on('seek', (event) => {
  console.log(event.state?.currentTime);
});

await controller.seek(150);
await controller.pause();
await controller.resume();
await controller.setPlaybackRate(1.5);
await controller.playBackward();
```

Current controller methods:

```txt
getState()
seek(time)
seekProgress(progress)
jumpToLabel(label)
playForward()
playBackward()
setPlaybackRate(rate)
pause()
resume()
cancel()
finish()
on()
once()
dispose()
```

Controller state:

```ts
const state = controller.getState();

console.log(state.status);
console.log(state.currentTime);
console.log(state.duration);
console.log(state.progress);
console.log(state.currentLabel);
console.log(state.activeTrackIndexes);
console.log(state.activeStepIndexes);
```

Unsupported operations should return skipped results with diagnostics, not fake success.

## 12. Playback events

Playback controllers emit events for lifecycle and runtime controls.

Important event types:

```txt
start
statusChange
pause
resume
cancel
finish
skip
fail
seek
progress
playbackRateChange
directionChange
```

Example:

```ts
const unsubscribe = controller.on('playbackRateChange', (event) => {
  console.log(event.status, event.state?.playbackRate);
});

unsubscribe();
```

## 13. Engine events

Engine events are configured globally when creating the engine.

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onBeforePlan: (event) => console.log('before plan', event.motionType),
    onPlan: (event) => console.log(event.plan.summary),
    onPlay: (event) => console.log('play', event.target),
    onFinish: (event) => console.log(event.result.status),
    onSkip: (event) => console.log(event.reason),
    onError: (event) => console.error(event.error)
  }
});
```

Engine events are observational. They should not be used to mutate the plan or playback result.

## 14. Reduced motion

A motion can respect reduced-motion preferences.

Common strategies:

```txt
skip: skip the motion
simplify: use a reduced-motion timeline
preserve: keep the original motion
```

Registered motions may expose `buildReducedMotionTimeline()`.

Direct timeline playback can also provide a reduced timeline:

```ts
await motion.playTimeline(element, timeline, {
  respectReducedMotion: true,
  reducedMotionStrategy: 'simplify',
  reducedMotionTimeline
});
```

## 15. Motion results and diagnostics

A playback returns a `MotionPlaybackResult`.

```ts
const result = await motion.playTimeline(element, timeline);

if (result.status === 'skipped') {
  console.log(result.reason);
}

for (const diagnostic of result.diagnostics ?? []) {
  console.log(diagnostic.level, diagnostic.code, diagnostic.message);
}
```

Result statuses:

```txt
finished
cancelled
skipped
failed
paused
running
```

Diagnostics contain:

```txt
level
code
message
source
metadata
```

Use `MotionDiagnosticCodes`, `MotionDiagnosticSources` and `MotionPlaybackResultReasons` instead of hard-coded strings when possible.

## 16. Timeline sampling

Sampling computes a timeline snapshot without playing it.

```ts
import { sampleMotionTimelineAtProgress } from '@structifyx/motion-core';

const sample = sampleMotionTimelineAtProgress(timeline, 0.5);

console.log(sample.time);
console.log(sample.progress);
console.log(sample.activeSteps);
```

Useful for:

```txt
previews
scrubbers
tests
visual builders
debug tools
controller state support
```

Progress sampling is not supported for infinite timelines.

## 17. Timeline inspection

Inspection creates a developer-friendly timeline report.

```ts
import { inspectMotionTimeline } from '@structifyx/motion-core';

const report = inspectMotionTimeline(timeline);

console.log(report.totalDuration);
console.log(report.animatedProperties);
console.log(report.diagnostics);
```

Useful for:

```txt
builder diagnostics
documentation
debugging
performance hints
QA reports
```

## 18. Motion compositions

A composition combines registered motions and direct timelines.

```ts
import { createMotionComposition } from '@structifyx/motion-core';

const composition = createMotionComposition((composition) => {
  composition.motion({
    type: 'fade-in',
    label: 'intro',
    at: 0,
    options: {
      fromOpacity: 0,
      toOpacity: 1
    }
  });

  composition.timeline({
    label: 'content',
    at: { label: 'intro', offset: 300 },
    timeline: createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step((step) => {
          step.from({ transform: 'translateY(12px)' });
          step.to({ transform: 'translateY(0)' });
        });
      });
    })
  });
});

await motion.playComposition(element, composition);
```

Composition rule:

```txt
MotionCompositionDefinition -> compileMotionComposition() -> MotionTimelineDefinition -> playback
```

Do not treat composition as a second runtime.

## 19. Creating a custom motion definition

Recommended modern API:

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  type InferMotionOptions
} from '@structifyx/motion-core';

const cardRevealOptions = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
    defaultValue: 24,
    min: 0,
    max: 120,
    unit: 'px'
  }),
  fade: option.boolean({
    label: 'Fade',
    defaultValue: true
  })
});

type CardRevealOptions = InferMotionOptions<typeof cardRevealOptions>;

export class CardRevealMotion extends SchemaMotionDefinition<typeof cardRevealOptions> {
  readonly type = 'card-reveal';
  readonly label = 'Card reveal';
  readonly description = 'Reveals a card with optional fade and vertical movement.';
  readonly category = 'entrance';

  protected readonly options = cardRevealOptions;

  buildTimeline(context: { readonly options: CardRevealOptions }) {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step((step) => {
          step.from({
            opacity: context.options.fade ? 0 : 1,
            transform: `translateY(${context.options.distance}px)`
          });
          step.to({
            opacity: 1,
            transform: 'translateY(0)'
          });
        });
      });
    });
  }
}
```

Then register it:

```ts
motion.register(new CardRevealMotion());
```

## 20. Creating a custom driver

A driver executes plans on a platform.

Minimal shape:

```ts
import type { MotionDriver, MotionPlayOptions, MotionPlaybackResult } from '@structifyx/motion-core';

export class MyDriver implements MotionDriver<MyTarget> {
  readonly name = 'my-driver';

  async play(target: MyTarget, options: MotionPlayOptions): Promise<MotionPlaybackResult> {
    // Execute options.plan.scheduledTimeline on your platform.
    return {
      status: 'finished'
    };
  }
}
```

Driver rule:

```txt
MotionDriver = platform execution adapter.
MotionDefinition = reusable animation definition.
```

Do not put animation authoring logic inside drivers unless it is platform translation logic.

## 21. Validation commands

Global validation:

```bash
pnpm format
pnpm test
pnpm typecheck
pnpm build
```

Package-specific validation:

```bash
pnpm --filter @structifyx/motion-core test
pnpm --filter @structifyx/motion-core typecheck
pnpm --filter @structifyx/motion-core build
```

## 22. Common mistakes to avoid

```txt
Do not import DOM types into motion-core.
Do not make createMotionTimeline() more important than MotionTimelineDefinition.
Do not add timeline.fade() / timeline.slide() shortcuts to the core builder.
Do not treat composition as a runtime.
Do not fake unsupported playback operations as finished.
Do not set optional properties to undefined.
Do not add new public exports without auditing them.
Do not publish before package metadata, README, changelog and pnpm pack checks are ready.
```

## 23. Next recommended work

Next phase:

```txt
Phase V1 Refactor 10 - finalisation release V1 package
```

Deliverables:

```txt
README root
README per publishable package
CHANGELOG.md
docs/release-v1-checklist.md
package.json publication metadata audit
exports/types/files audit
pnpm pack verification
final docs examples audit
```
