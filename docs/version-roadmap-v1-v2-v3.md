# Structifyx Motion Engine - Roadmap V1 / V2 / V3

> Status: planning document.
> Scope: product roadmap, versioning rules and release boundaries.
> Goal: define what must be finished before V1, what belongs to V1.x, V2 and V3, and prevent uncontrolled scope creep.
> Last updated after: `77f3beb docs(core): add tsdoc to engine factory and base definitions`.

## 1. Why this document exists

Structifyx Motion Engine is becoming a real animation engine, not only a collection of helpers.

Without clear release boundaries, the project can become infinite. This document defines:

```txt
what V1 must contain
what V1.x may add
what bugfix versions mean
what V2 must contain
what V3 should explore
what must not be started too early
```

The goal is to publish a stable V1 with a strong core, then evolve deliberately.

## 2. Versioning policy

The project follows semantic versioning.

```txt
MAJOR.MINOR.PATCH
```

Meaning:

```txt
MAJOR = strategic capability layer or breaking public API change
MINOR = compatible feature addition inside the same major promise
PATCH = bugfix, docs, tests or small internal fix
```

Patch versions should not add new public features.

Minor versions may add features, but must not secretly start the next major version.

Major versions may introduce new concept families and require migration guides if public APIs change.

## 3. Release boundary rule

A later major version must not be used to finish an incomplete previous major version.

```txt
V1 must be stable and complete for its stated scope.
V2 must not be used to finish missing V1 basics.
V3 must not be used to finish missing V2 basics.
```

## 4. Current project state before V1

Current estimated state:

```txt
V1 technical progress: about 88-92%
V1 publishable progress: about 75-80%
```

Why publishable progress is lower than technical progress:

```txt
- package metadata still needs release audit
- README files need release-level polish
- CHANGELOG.md is not yet prepared
- pnpm pack checks are not yet documented/executed as release gates
- public exports need final package-level review
- npm publication strategy still needs a decision
```

## 5. Already implemented or documented

```txt
motion-core architecture
MotionDefinition
BaseMotionDefinition
SchemaMotionDefinition
option schema helpers
option validators
MotionTimelineDefinition
createMotionTimeline()
direct timeline playback
registry
defaults
validation
planning
scheduling
execution plan
engine events
skip event
playback controller abstractions
playback state
seek(time)
seekProgress(progress)
jumpToLabel(label)
playForward()
playBackward()
setPlaybackRate(rate)
currentLabel
active playback indexes
advanced playback events
Timeline Sampler
Timeline Inspector
composition compiler
composition builder
composition runtime shortcuts
composition block offset placement
composition item labels
centralized diagnostics
centralized diagnostic codes
centralized diagnostic sources
centralized playback result reasons
centralized engine/playback event types
motion-web driver
motion-pack-basic
vanilla example
custom MotionDefinition guide
custom MotionDriver guide
composition API guide
timeline sampler API guide
TSDoc public API documentation pass
```

## 6. V1 objective

V1 must be the first stable public version.

V1 promise:

```txt
A framework-agnostic TypeScript animation engine that can define, compose,
validate, plan, inspect, sample and control animations through a stable core API,
with an official Web driver and a documented extension model.
```

V1 should be good enough to use in real projects such as:

```txt
Structifyx
Sondatio
visual builders
Angular applications through future adapters
React applications through future adapters
vanilla Web applications
plugin-based platforms
```

## 7. V1 required feature set and current status

### 7.1 Core architecture and public contracts

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
MotionDefinition
MotionDriver
MotionEngine
MotionTimelineDefinition
MotionCompositionDefinition
MotionPlaybackController
MotionPlaybackResult
MotionExecutionPlan
MotionDiagnostic
```

### 7.2 Timeline builder and direct timeline API

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
createMotionTimeline()
MotionTimelineBuilder
MotionTrackBuilder
MotionStepBuilder
labels
anchors
stagger
defaults
timing options
iterations
yoyo
direction
playbackRate
```

### 7.3 Motion definitions and options DX

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
BaseMotionDefinition
SchemaMotionDefinition
defineMotionOptions()
option.number()
option.range()
option.string()
option.boolean()
option.select()
option.color()
InferMotionOptions
option validators
numeric validators
```

### 7.4 Composition API

Status:

```txt
Implemented, tested, documented.
```

Includes:

```txt
MotionCompositionDefinition
createMotionComposition()
MotionCompositionBuilder
compileMotionComposition()
motion.planComposition()
motion.playComposition()
motion.createCompositionPlayback()
composition block offset placement
composition item labels
```

V1 does not require:

```txt
nested composition groups
composition-specific reduced motion
composition presets
advanced composition diagnostics object model
```

### 7.5 Timeline Sampler

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
sampleMotionTimeline()
sampleMotionTimelineAtTime()
sampleMotionTimelineAtProgress()
MotionTimelineSample
MotionTimelineTrackSample
MotionTimelineStepSample
```

Current limitations acceptable for V1:

```txt
No advanced transform interpolation yet.
No color interpolation yet.
No easing curve sampling yet.
No filter interpolation yet.
```

### 7.6 Playback state and advanced controls

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
MotionPlaybackState
getState()
seek(time)
seekProgress(progress)
jumpToLabel(label)
playForward()
playBackward()
setPlaybackRate(rate)
currentLabel
activeTrackIndexes
activeStepIndexes
```

### 7.7 Advanced playback events

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
seek
progress
playbackRateChange
directionChange
```

Plus base events:

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

### 7.8 Timeline Inspector

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
inspectMotionTimeline()
MotionTimelineInspection
MotionTimelineTrackInspection
MotionTimelineStepInspection
MotionTimelineLabelInspection
```

Diagnostics:

```txt
timeline-inspection-infinite-timeline
timeline-inspection-long-timeline
timeline-inspection-empty-step-keyframes
timeline-inspection-long-step
```

### 7.9 Diagnostics system

Status:

```txt
Implemented, tested, documented with TSDoc.
```

Includes:

```txt
MotionDiagnosticCodes
MotionDiagnosticSources
MotionPlaybackResultReasons
diagnostic factories
playback diagnostic factories
```

## 8. Remaining V1 work

The remaining V1 work is mostly release readiness, not engine feature design.

Required before a public release:

```txt
README root updated
README per publishable package or package docs updated
CHANGELOG.md created
release checklist created
package.json metadata audited
exports/types/files audited
dist output audited
pnpm pack tested for publishable packages
examples verified against final docs
publication strategy decided
versioning decision made: keep 0.x pre-release or prepare 1.0.0
```

## 9. Phase V1 Refactor 10 - release package readiness

Recommended sub-steps:

```txt
10.1 Audit root package.json.
10.2 Audit packages/motion-core/package.json.
10.3 Audit packages/motion-web/package.json.
10.4 Audit packages/motion-pack-basic/package.json.
10.5 Decide publishable packages.
10.6 Add or refresh README.md at repository root.
10.7 Add or refresh package-specific README files.
10.8 Add CHANGELOG.md.
10.9 Add docs/release-v1-checklist.md.
10.10 Run pnpm clean/build and inspect dist.
10.11 Run pnpm pack for publishable packages.
10.12 Verify generated .d.ts public exports.
10.13 Final docs examples audit.
10.14 Final validation: format/test/typecheck/build.
```

## 10. V1.x candidates

After V1, compatible minor versions may add:

```txt
extra basic motions
more keyframe interpolation helpers
color interpolation in sampler
transform interpolation in sampler
additional diagnostics
more Web driver conveniences
small builder utilities that do not hide MotionTimelineDefinition
better examples
framework-specific examples without making them core dependencies
```

## 11. V2 candidates

V2 may introduce larger capability layers:

```txt
advanced composition groups
scene/sequence authoring model
plugin/preset registry architecture
framework adapters with clear boundaries
advanced devtools integration
builder-oriented metadata layer
more platform drivers
```

V2 must not be used to finish missing V1 basics.

## 12. V3 exploration

V3 may explore product-level ecosystem ideas:

```txt
visual editor integration
marketplace-like motion pack ecosystem
advanced timeline devtools
AI-assisted motion authoring
cross-platform runtime adapters
project-level animation governance
```

## 13. Do not start too early

Avoid before V1 release readiness:

```txt
visual builder complete
plugin marketplace
large API redesign
new major driver ecosystem
Angular official adapter
React official adapter
animation preset store
AI authoring workflows
```

## 14. Last known validation

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
pnpm --filter @structifyx/motion-core build: OK
motion-core: 29 test files / 328 tests passed
motion-web: 12 test files / 159 tests passed
motion-pack-basic: 4 test files / 25 tests passed
examples/vanilla build OK
```
