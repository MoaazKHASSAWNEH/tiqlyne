# Tiqlyne Motion Engine - Current API Status

> Status: documentation addendum.
> Purpose: keep the developer documentation aligned with the current implementation.
> Scope: documentation only.
> Last verified state: after `77f3beb docs(core): add tsdoc to engine factory and base definitions`.

## 1. Why this addendum exists

`docs/developer-api-guide.md` is the historical developer-facing guide, but the API has moved quickly.

This addendum is the source of truth for the current implementation state. It should be read with:

```txt
docs/project-handoff.md
docs/chatgpt-project-resume.md
docs/complete-usage-guide.md
```

## 2. Current maturity level

Current status:

```txt
Architecture foundation: strong
Core / driver separation: strong
Direct API usability: good
Registry workflow: good
Global config: implemented
Engine events: implemented
Skip event: implemented
Playback controller base lifecycle: implemented
Playback state: implemented
Seek/progress controls: implemented
Jump to label: implemented
Forward/backward direction controls: implemented
Playback rate controls: implemented
Advanced playback events: implemented
Timeline sampler: implemented and tested
Timeline inspector: implemented and tested
Composition compiler: implemented
Composition builder: implemented
Composition runtime shortcuts: implemented
Composition block offset placement: implemented
Composition item labels: implemented
Centralized diagnostics: implemented
Centralized diagnostic codes: implemented
Centralized diagnostic sources: implemented
Centralized playback result reasons: implemented
Centralized event types: implemented
TSDoc public API pass: completed
Web driver: implemented and tested
Basic motion pack: implemented and tested
Vanilla example: builds successfully
Versioning policy: written but should be refreshed before release
Publication readiness: next phase
```

Current package state:

```txt
root package: private true
workspace version: 0.1.0
@tiqlyne/motion-core: 0.1.0
@tiqlyne/motion-web: 0.1.0
@tiqlyne/motion-pack-basic: 0.1.0
```

## 3. Current usage modes

The engine currently supports these main usage modes:

```txt
registered motions
direct timelines
motion compositions
timeline sampling
timeline inspection
playback controllers
custom motion definitions
custom motion drivers
web execution through motion-web
```

## 4. Current public API groups

### 4.1 Engine

```txt
createMotionEngine()
MotionEngine
MotionEngineConfig
DefaultMotionEngine
MotionEngineEvents
MotionEngineEventTypes
MotionEngineEventSources
```

Important engine methods:

```txt
register()
registerMany()
has()
get()
getAll()
getByCategory()
play()
playTimeline()
playComposition()
plan()
planTimeline()
planComposition()
createPlayback()
createTimelinePlayback()
createCompositionPlayback()
cancel()
finish()
reset()
```

### 4.2 Timeline and builder

```txt
MotionTimelineDefinition
MotionTrackDefinition
MotionStepDefinition
MotionTimelineDefaults
MotionTimelineLabels
MotionStepPosition
MotionTargetReference
MotionKeyframe
createMotionTimeline()
createMotionTimelineBuilder()
MotionTimelineBuilder
MotionTrackBuilder
MotionStepBuilder
```

### 4.3 Motion definitions and options

```txt
MotionDefinition
BaseMotionDefinition
SchemaMotionDefinition
MotionBuildContext
defineMotionOptions()
DefinedMotionOptions
InferMotionOptions
MotionOptionsSchema
option.number()
option.range()
option.string()
option.boolean()
option.select()
option.color()
MotionOptionValidator
runMotionOptionValidators()
validateDifferent()
validateGreaterThan()
validateGreaterThanOrEqual()
validateLessThan()
validateLessThanOrEqual()
validateIncreasing()
validateDecreasing()
```

### 4.4 Composition

```txt
MotionCompositionDefinition
RegisteredMotionCompositionItem
TimelineCompositionItem
CompileMotionCompositionContext
createMotionComposition()
MotionCompositionBuilder
compileMotionComposition()
motion.planComposition()
motion.playComposition()
motion.createCompositionPlayback()
```

Current composition behavior:

```txt
- item.at shifts the compiled item as a block.
- item.label creates a numeric timeline label from the item position.
- later items may reference earlier labels.
- composition compiles to MotionTimelineDefinition before runtime playback.
```

### 4.5 Playback controller

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

Current playback state fields:

```txt
status
currentTime
duration
progress
playbackRate
direction
activeTrackIndexes
activeStepIndexes
currentLabel
```

Current advanced playback event types:

```txt
seek
progress
playbackRateChange
directionChange
```

Base playback event types also include:

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

### 4.6 Timeline sampler

Main APIs:

```txt
sampleMotionTimeline()
sampleMotionTimelineAtTime()
sampleMotionTimelineAtProgress()
```

Current sampler support:

```txt
sampling by time
sampling by progress on finite timelines
pending / active / completed step status
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

### 4.7 Timeline inspector

Main API:

```txt
inspectMotionTimeline()
```

Current inspector output:

```txt
totalDuration
trackCount
stepCount
labelCount
labels
targets
animatedProperties
tracks
diagnostics
```

Current inspector diagnostics:

```txt
timeline-inspection-infinite-timeline
timeline-inspection-long-timeline
timeline-inspection-empty-step-keyframes
timeline-inspection-long-step
```

### 4.8 Diagnostics and reasons

```txt
MotionDiagnostic
MotionDiagnosticCodes
MotionDiagnosticSources
MotionPlaybackResultReasons
createMotionDiagnostic()
createMotionInfoDiagnostic()
createMotionWarningDiagnostic()
createMotionErrorDiagnostic()
createPlaybackInvalidTransitionDiagnostic()
createPlaybackUnsupportedDiagnostic()
createPlaybackInvalidInputDiagnostic()
createPlaybackOperationFailedDiagnostic()
```

Diagnostic codes are for structured details. Playback result reasons summarize operation outcomes.

## 5. Web driver summary

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
controller seek/progress/label/direction/rate controls where WAAPI allows it
state reporting through WebMotionPlaybackController
```

For the complete Web reference:

```txt
docs/web-driver-quickstart.md
```

## 6. Basic motion pack summary

Current basic motions:

```txt
fade-in
fade-out
slide-in
```

Current implementation style:

```txt
SchemaMotionDefinition
defineMotionOptions()
InferMotionOptions
option validators
reduced-motion timeline for slide-in
```

## 7. Documentation map

```txt
docs/chatgpt-project-resume.md
  Compact resume for opening a new ChatGPT discussion.

docs/project-handoff.md
  Main project handoff. Read first when resuming the project.

docs/complete-usage-guide.md
  Complete usage guide for developers.

docs/developer-api-guide.md
  Historical developer API guide. Should stay aligned, but use this status file for latest state.

docs/version-roadmap-v1-v2-v3.md
  V1/V2/V3 scope, version rules and release checklist.

docs/timeline-sampler-api.md
  Timeline Sampler API guide.

docs/motion-composition-api.md
  Composition API reference.

docs/playback-controller-behavior.md
  Playback controller behavior reference.

docs/playback-state-api.md
  Playback state reference.

docs/playback-seek-api.md
  Seek/progress/label playback controls reference.

docs/engine-events-api.md
  Global engine events reference.

docs/skip-event-api.md
  onSkip lifecycle event reference.

docs/writing-custom-motion-definition.md
  Guide for creating custom reusable MotionDefinition classes.

docs/writing-custom-motion-driver.md
  Guide for creating custom platform MotionDriver adapters.

docs/web-driver-quickstart.md
  Quickstart for motion-core + motion-web.

docs/motion-core-web-examples.md
  Practical examples guide for core + Web usage.
```

## 8. Current completed milestones

Important completed milestones include:

```txt
1. timeline builder API
2. direct timeline playback API
3. createMotionEngine facade
4. engine defaults and validation config
5. engine registry helpers
6. global playback event listeners
7. skip event
8. execution plans and scheduling path
9. stagger and advanced stagger
10. labels and anchors
11. playback timing options
12. playbackRate support
13. iterations infinite and yoyo support
14. SchemaMotionDefinition and option schema helpers
15. basic motions migrated to schema definitions
16. numeric option validators
17. motion composition compiler
18. motion composition builder
19. composition runtime shortcuts
20. composition block offset placement
21. composition item labels
22. timeline sampler
23. playback state model
24. seek(time)
25. seekProgress(progress)
26. jumpToLabel(label)
27. playback direction controls
28. playback rate control
29. current playback label
30. active playback indexes
31. advanced playback events
32. timeline inspector
33. diagnostic factories and sources
34. centralized diagnostic codes
35. centralized playback result reasons
36. centralized event types
37. TSDoc public API pass
```

## 9. Recommended next steps

Recommended next phase:

```txt
Phase V1 Refactor 10 - finalisation release V1 package
```

Recommended order:

```txt
1. Audit package.json for each package.
2. Decide which packages are publishable.
3. Add or update README files.
4. Add CHANGELOG.md.
5. Add docs/release-v1-checklist.md.
6. Audit exports and generated .d.ts files.
7. Run pnpm pack for publishable packages.
8. Fix documentation examples if they drift from implementation.
9. Decide release version strategy.
10. Final validation before release.
```

Do not start yet:

```txt
visual builder complete
new major driver ecosystem
Angular/React official adapters
plugin marketplace
large API redesign
```

## 10. Rules to preserve

```txt
- motion-core must stay framework-agnostic.
- motion-core must not import DOM, WAAPI, Angular, React or GSAP.
- MotionTimelineDefinition remains the serializable runtime source of truth.
- MotionCompositionDefinition remains the serializable authoring/orchestration source of truth.
- Composition must compile to MotionTimelineDefinition before playback.
- Timeline sampling must remain platform-independent.
- Timeline inspection must remain platform-independent.
- MotionDriver is a platform adapter, not an animation definition.
- New platform drivers should live outside motion-core.
- Optional properties must be omitted rather than set to undefined.
- Use skipped for controlled unsupported operations.
- Use failed for unexpected runtime failures.
- Keep timeline building explicit. Do not add animation-specific shortcuts such as timeline.fade().
```

## 11. Last known validation

Last known complete validation passed after:

```txt
77f3beb docs(core): add tsdoc to engine factory and base definitions
```

Known validation result:

```txt
git status: clean
pnpm format: OK
pnpm test: OK
pnpm typecheck: OK
pnpm build: OK
pnpm --filter @tiqlyne/motion-core build: OK
motion-core: 29 test files passed / 328 tests passed
motion-pack-basic: 4 test files passed / 25 tests passed
motion-web: 12 test files passed / 159 tests passed
examples/vanilla build OK
```
