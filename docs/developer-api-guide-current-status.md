# Structifyx Motion Engine - Current API Status

> Status: documentation addendum.
> Purpose: keep the developer documentation aligned with the current implementation.
> Scope: documentation only.
> Last verified state: after `e263246 feat(core): add timeline sampler`.

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
Timeline Sampler: implemented and tested
Web driver: implemented and tested
Vanilla example: infinite/yoyo/controller + composition demo
Versioning policy: written
Custom MotionDefinition guide: written
Custom MotionDriver guide: written
Timeline Sampler guide: written
Composition API guide: written
Composition compiler: implemented
Composition builder: implemented
Composition runtime shortcuts: implemented
Composition block offset placement: implemented
Composition item labels: implemented
Playback state: not yet implemented
Advanced seek/progress controls: not yet implemented
Timeline inspector: not yet implemented
```

## 3. Current usage modes

The engine supports these main usage modes:

```txt
registered motions
direct timelines
timeline sampling
motion compositions
custom motion definitions
custom motion drivers
```

## 4. Timeline sampling

Timeline Sampler is now implemented in `motion-core`.

Main APIs:

```txt
sampleMotionTimeline()
sampleMotionTimelineAtTime()
sampleMotionTimelineAtProgress()
```

Purpose:

```txt
Compute timeline state at a specific time or progress without playing the animation.
```

Current sampler support:

```txt
sampling by time
sampling by progress on finite timelines
pending / active / completed step status
labels through preparation
reverse direction
yoyo sampling
finite and infinite iterations
opacity interpolation
custom numeric interpolation
discrete fallback for non-numeric values
```

Progress sampling on infinite timelines throws:

```txt
timeline-sample-infinite-progress-unsupported
```

Timeline sampling does not emit engine events because it does not play, plan through the engine facade, or call a driver.

For the complete sampler reference:

```txt
docs/timeline-sampler-api.md
```

## 5. Composition status

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

Current behavior:

```txt
item.at shifts the compiled item as a block.
item.label creates a numeric timeline label from item.at.
later items may reference earlier item labels.
```

Composition label errors currently include:

```txt
composition-duplicate-label
composition-item-label-reference-missing
composition-item-label-anchor-position-unsupported
```

## 6. Custom motion definitions

The recommended way to create reusable custom motions is documented in:

```txt
docs/writing-custom-motion-definition.md
```

The recommended API is:

```txt
SchemaMotionDefinition
defineMotionOptions()
option.*
optionValidators
createMotionTimeline()
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

## 7. Custom motion drivers

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

## 8. Event system summary

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

## 9. Playback controller status

Playback controllers currently support:

```txt
pause()
resume()
cancel()
finish()
dispose()
events
```

Advanced controller methods are not implemented yet:

```txt
getState()
seek()
seekProgress()
jumpToLabel()
reverse()
setPlaybackRate()
```

Important current behavior:

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

## 10. Web driver summary

The Web driver currently supports:

```txt
Element targets
self / child / selector / named target resolution
transform conversion
filter and paint property conversion
numeric length -> px
numeric angle -> deg
iterations / direction / yoyo / endDelay / playbackRate mapping
reduced motion skip/simplify/preserve
conflict strategy ignore/replace/parallel
controller pause/resume/cancel/finish/dispose
```

For the complete Web reference:

```txt
docs/web-driver-quickstart.md
```

## 11. Documentation map

```txt
docs/project-handoff.md
  Main project handoff. Read first when resuming the project.

docs/version-roadmap-v1-v2-v3.md
  V1/V2/V3 scope, version rules and release checklist.

docs/timeline-sampler-api.md
  Current Timeline Sampler API guide.

docs/motion-composition-api.md
  Current composition API reference.

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
```

## 12. Current completed milestones

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
33. docs: add V1 V2 V3 version roadmap
34. feat(core): add timeline sampler
35. docs: add timeline sampler API guide
```

## 13. Recommended next steps

Recommended next steps now:

```txt
1. feat(core): add MotionPlaybackState model
2. feat(core): add seek(time)
3. feat(core): add seekProgress(progress)
4. feat(core): add jumpToLabel(label)
5. feat(core): add reverse/playBackward minimal
6. feat(core): add setPlaybackRate(rate)
7. feat(core): add advanced playback events minimum
8. feat(core): add inspectMotionTimeline()
9. docs: prepare V1 publication docs
```

Avoid starting a complete visual builder or broad driver ecosystem immediately. Keep focus on V1 core playback features.

## 14. Rules to preserve

```txt
- motion-core must stay framework-agnostic.
- motion-core must not import DOM, WAAPI, Angular, React or GSAP.
- MotionTimelineDefinition remains the serializable runtime source of truth.
- MotionCompositionDefinition remains the serializable authoring/orchestration source of truth for compositions.
- Composition must compile to MotionTimelineDefinition before playback.
- Timeline sampling must remain platform-independent.
- MotionDriver is a platform adapter, not an animation definition.
- New platform drivers should live outside motion-core.
- Optional properties must be omitted rather than set to undefined.
- Use skipped for controlled unsupported operations.
- Use failed for unexpected runtime failures.
- Keep timeline building explicit. Do not add animation-specific shortcuts such as timeline.fade().
```

## 15. Local validation reminder

Recommended local commands:

```bash
git pull
pnpm format
pnpm test
pnpm build
```

Last known complete validation passed after:

```txt
e263246 feat(core): add timeline sampler
```

Known validation result:

```txt
motion-core: 22 test files passed
motion-core: 302 tests passed
motion-pack-basic: 4 test files passed
motion-pack-basic: 25 tests passed
motion-web: 12 test files passed
motion-web: 159 tests passed
motion-core build OK
motion-web build OK
motion-pack-basic build OK
examples/vanilla build OK
```
