# Structifyx Motion Engine - Current API Status

> Status: documentation addendum.
> Purpose: keep the developer documentation aligned with the current implementation.
> Scope: documentation only.
> Last verified state: after `9e336a0 docs: add custom motion driver guide`.

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
Vanilla example: infinite/yoyo/controller + composition demo
Plugin/preset documentation: partial
Custom MotionDefinition guide: written
Custom MotionDriver guide: written
Composition API guide: written
Composition compiler: implemented
Composition builder: implemented
Composition runtime shortcuts: implemented
Composition block offset placement: implemented
Composition item labels: implemented
Versioning policy: not yet implemented
```

The project has moved beyond a pure prototype. The core API foundation is usable and tested, and the documentation has started to split into focused guides.

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

The engine supports five main usage modes.

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

### 4.3 Motion compositions

```ts
const composition = createMotionComposition((composition) => {
  composition.motion('fade-in', {
    label: 'card-enter',
    at: 300
  });

  composition.motion('slide-in', {
    at: {
      label: 'card-enter',
      offset: 150
    },
    options: {
      direction: 'bottom',
      distance: 32,
      fade: false
    }
  });
});

await motion.playComposition(element, composition);
```

Use compositions to orchestrate several registered motions or direct timelines while keeping the runtime path unified.

Composition rule:

```txt
MotionCompositionDefinition
  -> compileMotionComposition()
  -> MotionTimelineDefinition
  -> planTimeline() / playTimeline() / createTimelinePlayback()
```

Available composition APIs:

```txt
MotionCompositionDefinition
createMotionComposition()
MotionCompositionBuilder
compileMotionComposition()
motion.planComposition()
motion.playComposition()
motion.createCompositionPlayback()
```

Current placement behavior:

```txt
item.at shifts the compiled item as a block.
```

Current item label behavior:

```txt
item.label creates a numeric timeline label from item.at.
later items may reference earlier item labels.
```

Composition label errors currently include:

```txt
composition-duplicate-label
composition-item-label-reference-missing
composition-item-label-anchor-position-unsupported
```

### 4.4 Custom motion definitions

The recommended way to create reusable custom motions is documented in:

```txt
docs/writing-custom-motion-definition.md
```

The recommended API is:

```txt
SchemaMotionDefinition
  Base class for typed reusable motions.

defineMotionOptions()
  Single source of truth for option metadata, defaults and normalization.

option.*
  Builders for number, range, string, boolean, select and color options.

optionValidators
  Semantic validators for relationships between normalized options.

createMotionTimeline()
  Explicit builder for serializable timelines.
```

Current reusable option validators include:

```txt
validateDifferent()
validateGreaterThan()
validateGreaterThanOrEqual()
validateLessThan()
validateLessThanOrEqual()
validateIncreasing()
validateDecreasing()
```

### 4.5 Custom motion drivers

The recommended way to create a platform adapter is documented in:

```txt
docs/writing-custom-motion-driver.md
```

The driver rule is:

```txt
MotionDriver = platform execution adapter
MotionDefinition = reusable animation definition
```

The current driver contract is intentionally small:

```txt
name
play()
optional cancel()
optional finish()
optional reset()
optional createPlayback()
```

The target type is generic:

```txt
MotionDriver<Element>
MotionDriver<string>
MotionDriver<CanvasObject>
MotionDriver<GameEntity>
```

Recommended driver implementation levels:

```txt
1. passive/debug driver
2. simple immediate driver
3. scheduled runtime driver
4. controlled playback driver
```

Current audit conclusion:

```txt
- the driver contract is small and healthy
- the target type is generic
- controls are optional
- executionPlan exposes prepared and scheduled timelines
- reduced motion and conflict strategy are explicit
- no core contract change is required before experimenting with a debug or canvas driver
```

Known driver limitations:

```txt
- no first-class driver capability declaration yet
- no driver-specific validation hook yet
- no standardized keyframe property support matrix yet
- no shared interpolation/easing runtime helper yet
- no generic active playback registry helper yet
```

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
  Comes from motion.playTimeline(target, timeline), motion.planTimeline(timeline), and the current composition runtime shortcuts after compilation.
```

Composition does not currently add a separate `composition` event source. The runtime shortcuts compile to a timeline and reuse the direct timeline pipeline.

`onSkip` is emitted for controlled skipped results such as disabled registered motions, unknown registered motion types, unsupported driver control operations and other explicit skip paths.

`onError` is emitted by `play()`, `playTimeline()` and `playComposition()` when they catch planning or runtime errors and return a failed `MotionPlaybackResult`.

Direct calls to `plan()`, `planTimeline()` and `planComposition()` still throw directly when planning fails.

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
composition-specific event source
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
web-playback-finish-not-supported-for-infinite-animation
```

Invalid timelines and invalid compositions are not skips. They remain planning errors and are observed through `onError` when using playback APIs that catch planning errors.

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

Composition playback controllers are also available:

```ts
const playback = motion.createCompositionPlayback(element, composition);
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
createMotionComposition()
motion.playTimeline()
motion.playComposition()
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
- test createMotionComposition()
- test compileMotionComposition()
- test motion.playComposition()
- display result and controller events
```

The current recommended approach is to keep examples small, focused and useful for debugging.

A useful future example would show a local custom motion created with `SchemaMotionDefinition` and registered in the vanilla app.

## 12. Documentation map

```txt
docs/project-handoff.md
  Main project handoff. Read first when resuming the project.

docs/developer-api-guide.md
  Main historical developer guide.

docs/developer-api-guide-current-status.md
  This current status addendum.

docs/motion-composition-api.md
  Current composition API reference, including runtime shortcuts, block offset placement and item labels.

docs/writing-custom-motion-definition.md
  Guide for creating custom reusable MotionDefinition classes.

docs/writing-custom-motion-driver.md
  Guide for creating custom platform MotionDriver adapters.

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

docs/development-motion-composition-design.md
  Internal design notes for the composition/orchestration API.

docs/development-motion-definition-dx-audit.md
  Internal audit for MotionDefinition developer experience.

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
15. feat(core): add playbackRate support
16. feat(core): add iterations infinite / yoyo support
17. feat(example): add minimal infinite yoyo visual test
18. fix(web): skip finish for infinite playback controllers
19. docs: document playback controller behavior
20. feat(core): add SchemaMotionDefinition and option schema helpers
21. refactor(basic): migrate basic motions to schema definitions
22. feat(core): add numeric option validators
23. docs: add custom motion definition guide
24. docs: add motion composition design
25. feat(core): add motion composition compiler
26. feat(core): add motion composition builder
27. docs(example): add vanilla motion composition demo
28. feat(core): add composition runtime shortcuts
29. docs: add motion composition API guide
30. feat(core): add composition block offset placement
31. feat(core): add composition item labels
32. docs: add custom motion driver guide
```

## 14. Recommended next steps

Recommended next steps now:

```txt
1. feat(debug): add experimental motion-debug driver package
2. feat(core): design nested composition groups
3. feat(core): add structured composition diagnostics later
4. feat(core): add per-item reduced motion compilation later
5. docs: split the large developer guide into concepts/api/guides pages
6. feat(core): add dynamic event subscription API later, for example motion.on(...)
```

Avoid starting a complete visual builder immediately. Keep `examples/vanilla` as a focused test until the engine documentation and orchestration API are more complete.

## 15. Rules to preserve

```txt
- motion-core must stay framework-agnostic.
- motion-core must not import DOM, WAAPI, Angular, React or GSAP.
- MotionTimelineDefinition remains the serializable runtime source of truth.
- MotionCompositionDefinition remains the serializable authoring/orchestration source of truth for compositions.
- Composition must compile to MotionTimelineDefinition before playback.
- MotionDriver is a platform adapter, not an animation definition.
- New platform drivers should live outside motion-core.
- createMotionTimeline() is a builder convenience, not a replacement for the model.
- createMotionComposition() is a builder convenience, not a replacement for the model.
- createMotionEngine() is the public factory.
- DefaultMotionEngine is an implementation detail for most users.
- Engine defaults must not override timeline, track or step values.
- Per-play validation must override engine validation.
- Engine events are observational.
- Controller events are separate from engine events.
- Optional properties must be omitted rather than set to undefined.
- Use skipped for controlled unsupported operations.
- Use failed for unexpected runtime failures.
- Keep timeline building explicit. Do not add animation-specific shortcuts such as timeline.fade().
- Validate custom motion intent with semantic option validators when possible.
```

## 16. Local validation reminder

Recommended local commands:

```bash
git pull
pnpm format
pnpm test
pnpm build
```

Last known complete validation passed after:

```txt
9866774 feat(core): add composition item labels
```

Known validation result:

```txt
21 test files passed
293 tests passed
motion-core build OK
motion-web build OK
motion-pack-basic build OK
examples/vanilla build OK
```

Latest documentation-only update:

```txt
9e336a0 docs: add custom motion driver guide
```
