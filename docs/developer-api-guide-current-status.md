# Structifyx Motion Engine - Current API Status

> Status: documentation addendum.
> Purpose: keep the developer documentation aligned with the current implementation.
> Scope: documentation only.
> Last verified state: after `5880634 fix(web): skip finish for infinite playback controllers`.

## 1. Why this addendum exists

`docs/developer-api-guide.md` is the main developer-facing guide, but it was written while the API was still moving quickly.

This addendum summarizes the current implementation state and points to the smaller reference documents that should be trusted for recent behavior.

## 2. Current maturity level

Current status:

```txt
Architecture foundation: strong
Core / driver separation: strong
Direct API usability: good
Registry workflow: good
Global config: first version ready
Engine events: first version implemented
Skip event: implemented
Playback controller: implemented
Web driver: implemented and tested
Vanilla example: minimal infinite/yoyo controller test
Plugin/preset documentation: partial
Custom MotionDefinition guide: not yet written
Custom MotionDriver guide: not yet written
Versioning policy: not yet implemented
```

The project has moved beyond a pure prototype. The core API foundation is now usable and tested, but the public documentation still needs to be split into smaller guides.

## 3. Current public engine config

The current `MotionEngineConfig` includes:

```ts
type MotionEngineConfig<TTarget = unknown> = {
  readonly driver: MotionDriver<TTarget>;
  readonly registry?: MotionRegistry;
  readonly normalizer?: MotionConfigNormalizer;
  readonly defaults?: MotionTimelineDefaults;
  readonly validation?: MotionValidationOptions;
  readonly events?: MotionEngineEvents<TTarget>;
};
```

Field meaning:

```txt
driver
  Required. Executes the generated timeline on a concrete platform.

registry
  Optional. Stores MotionDefinition instances.

normalizer
  Optional. Normalizes MotionConfig values.

defaults
  Optional. Global timeline defaults applied by the engine.

validation
  Optional. Global validation options used by the engine.

events
  Optional. Global engine lifecycle listeners.
  Events are observational and should not be used to mutate planning/playback behavior.
```

## 4. Current usage modes

The engine supports two main usage modes.

### 4.1 Registered motions

```ts
await motion.play(element, {
  id: 'hero-in',
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 56,
    fade: true
  }
});
```

Use registered motions for reusable named effects distributed by packages such as `@structifyx/motion-pack-basic`.

### 4.2 Direct timelines

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(element, timeline);
```

Use direct timelines for custom runtime animations, examples, builders and low-level testing.

## 5. Event system summary

The current engine event system exposes these callbacks:

```txt
onBeforePlan
onPlan
onPlay
onFinish
onCancel
onSkip
onError
```

Event sources:

```txt
registered-motion
  Comes from motion.play(target, config).

direct-timeline
  Comes from motion.playTimeline(target, timeline) or motion.planTimeline(timeline).
```

Successful playback order:

```txt
onBeforePlan
onPlan
onPlay
onFinish
```

Planning-only calls emit:

```txt
onBeforePlan
onPlan
```

`onSkip` is emitted for controlled skipped results such as disabled registered motions, unknown registered motion types, unsupported driver control operations and other explicit skip paths.

`onError` is emitted by `play()` and `playTimeline()` when they catch planning or runtime errors and return a failed `MotionPlaybackResult`.

Direct calls to `plan()` and `planTimeline()` still throw directly when planning fails.

## 6. Event limits

The current implementation deliberately does not include:

```txt
onProgress
onPause
onResume
onRepeat
onReverse
onSeek
onStepStart
onStepFinish
onTrackStart
onTrackFinish
onEveryFrame
dynamic motion.on(...) subscriptions
engine listener unsubscribe support
```

Do not document those as available until implemented and tested.

## 7. Skip event summary

`onSkip` observes skipped operations.

Current important skip reasons include:

```txt
motion-disabled
unknown-motion-type
driver-cancel-not-supported
driver-finish-not-supported
driver-reset-not-supported
```

Invalid timelines are not skips. They remain planning errors and are observed through `onError` when using `play()` or `playTimeline()`.

For complete skip details:

```txt
docs/skip-event-api.md
```

## 8. Playback controller status

Playback controllers are implemented for controlled playback.

Typical usage:

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

Important recent behavior:

```txt
finish() on an infinite Web animation returns skipped, not failed.
```

Expected result:

```txt
status: skipped
reason: web-playback-finish-not-supported-for-infinite-animation
```

The controller keeps its previous `running` or `paused` status so the UI can still use `pause`, `resume` or `cancel` after an unsupported `finish()` attempt.

For complete controller behavior:

```txt
docs/playback-controller-behavior.md
```

## 9. Infinite, yoyo and direction status

Current timing support includes:

```txt
iterations: number | 'infinite'
direction: normal | reverse | alternate | alternate-reverse
yoyo: boolean
endDelay: number
playbackRate: number
```

Important validation rule:

```txt
yoyo: true cannot be used together with direction.
```

Valid infinite yoyo:

```ts
{
  iterations: 'infinite',
  yoyo: true
}
```

Valid infinite alternate:

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

Diagnostic:

```txt
timeline-yoyo-direction-conflict
```

## 10. Web driver summary

The Web driver documentation explains how to use:

```txt
@structifyx/motion-core
@structifyx/motion-web
@structifyx/motion-pack-basic
createMotionEngine<Element>()
WebMotionDriver
createMotionTimeline()
motion.playTimeline()
motion.play()
engine events
playback controllers
```

The Web driver currently supports:

```txt
- Element targets
- self / child / selector / named target resolution
- transform conversion
- filter and paint property conversion
- numeric length -> px
- numeric angle -> deg
- iterations / direction / yoyo / endDelay / playbackRate mapping
- reduced motion skip/simplify/preserve
- conflict strategy ignore/replace/parallel
- controller pause/resume/cancel/finish/dispose
```

For the complete Web reference:

```txt
docs/web-driver-quickstart.md
```

## 11. Examples status

`examples/vanilla` is currently intentionally simple.

It is not a full visual builder.

Current purpose:

```txt
- test iterations: 'infinite'
- test yoyo
- test createTimelinePlayback()
- test pause/resume
- test finish on infinite -> skipped
- test cancel/reset
- display result and controller events
```

The complete visual builder idea was postponed because it mixed two goals:

```txt
1. testing the engine
2. building an animation editor
```

The current recommended approach is to keep examples small, focused and useful for debugging.

## 12. Documentation map

```txt
docs/project-handoff.md
  Main project handoff. Read first when resuming the project.

docs/developer-api-guide.md
  Main historical developer guide.

docs/developer-api-guide-current-status.md
  This current status addendum.

docs/engine-events-api.md
  Detailed reference for global engine events.

docs/skip-event-api.md
  Detailed reference for the onSkip lifecycle event.

docs/web-driver-quickstart.md
  Audited quickstart for motion-core + motion-web usage.

docs/playback-controller-behavior.md
  Detailed playback controller behavior reference.

docs/motion-core-web-examples.md
  Practical examples guide for core + Web usage.

docs/development-architecture-audit.md
  Internal architecture audit and technical analysis.

docs/development-direct-api-design.md
  Direct API design notes and implementation order.
```

## 13. Current completed milestones

```txt
1. feat(core): add timeline builder API
2. feat(core): add direct timeline playback API
3. feat(core): add createMotionEngine facade
4. feat(core): add engine defaults and validation config
5. feat(core): add engine registry helpers
6. refactor(pack-basic): use timeline builder
7. feat(core): add global playback event listeners
8. feat(core): add skip event
9. docs: add web driver quickstart
10. docs: add motion core web examples
11. feat(core,web): add execution plans / scheduling path
12. feat(core,web): add stagger and advanced stagger
13. feat(core,web): add labels and anchors
14. feat(core,web): add playback timing options
15. feat(core,web): add playbackRate support
16. feat(core,web): add iterations infinite / yoyo support
17. feat(example): add minimal infinite yoyo visual test
18. fix(web): skip finish for infinite playback controllers
19. docs: document playback controller behavior
```

## 14. Recommended next steps

Recommended next steps now:

```txt
1. docs: finish aligning docs around infinite/yoyo/controller behavior
2. docs: add writing a custom MotionDefinition guide
3. docs: add writing a custom MotionDriver guide
4. docs: split the large developer guide into concepts/api/guides pages
5. feat(core): add dynamic event subscription API later, for example motion.on(...)
```

Avoid starting a complete visual builder immediately. Keep `examples/vanilla` as a focused test until the engine documentation is more complete.

## 15. Rules to preserve

```txt
- motion-core must stay framework-agnostic.
- motion-core must not import DOM, WAAPI, Angular, React or GSAP.
- MotionTimelineDefinition remains the serializable source of truth.
- createMotionTimeline() is a builder convenience, not a replacement for the model.
- createMotionEngine() is the public factory.
- DefaultMotionEngine is an implementation detail for most users.
- Engine defaults must not override timeline, track or step values.
- Per-play validation must override engine validation.
- Engine events are observational.
- Controller events are separate from engine events.
- Optional properties must be omitted rather than set to undefined.
- Use skipped for controlled unsupported operations.
- Use failed for unexpected runtime failures.
```

## 16. Local validation reminder

Recommended local commands:

```bash
git pull
pnpm format
pnpm build
pnpm typecheck
pnpm -r --workspace-concurrency=1 test
```

Last known complete validation passed after the Web infinite finish fix.
