# Structifyx Motion Engine - Roadmap V1 / V2 / V3

> Status: planning document.
> Scope: product roadmap, versioning rules and release boundaries.
> Goal: define what must be finished before V1, what belongs to V1.x, V2 and V3, and prevent uncontrolled scope creep.

## 1. Why this document exists

Structifyx Motion Engine is becoming a real animation engine, not only a collection of animation helpers.

Without clear release boundaries, the project can become infinite.

This document defines:

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

The project follows a strict semantic versioning strategy adapted to this project.

Version format:

```txt
MAJOR.MINOR.PATCH
```

Example:

```txt
1.5.10
```

Meaning:

```txt
1 = major version
5 = minor feature version
10 = patch / bugfix version
```

## 3. Major version rule

A major version introduces a new strategic capability layer.

Examples:

```txt
1.0.0
  First stable public engine.

2.0.0
  New major feature family that changes what the engine can do.

3.0.0
  New product-level evolution, such as plugin ecosystem, editor/devtools or advanced platform expansion.
```

Rule:

```txt
A major version can introduce new big concepts.
A major version may include breaking changes only when justified and documented.
A major version must have a migration guide if public APIs change.
```

## 4. Minor version rule

A minor version improves or extends the current major version without changing its core promise.

Examples:

```txt
1.1.0
  Adds small features strongly related to V1.

1.3.0
  Adds mini features, API refinements, extra helpers or small improvements related to V1.

1.5.0
  Adds stronger improvements but still inside the V1 feature family.
```

Rule:

```txt
A minor version may add features.
A minor version must remain compatible with the major version promise.
A minor version must not secretly start the next major version.
```

## 5. Patch version rule

A patch version fixes bugs, improves tests, improves documentation, or makes small internal fixes without changing the feature set.

Examples:

```txt
1.1.1
  Bugfix after 1.1.0.

1.5.10
  Tenth patch after 1.5.0.
```

Rule:

```txt
A patch version should not add new public features.
A patch version should not change public API behavior unless it fixes a bug.
A patch version may add tests and documentation.
```

## 6. Important release boundary rule

A later major version must not be used to finish an incomplete previous major version.

This means:

```txt
V1 must be stable and complete for its stated scope.
V2 must not be used to finish missing V1 basics.
V3 must not be used to finish missing V2 basics.
```

Allowed:

```txt
V1.1.0 improves V1 features.
V1.5.10 fixes V1 bugs.
V2.0.0 introduces a new major capability family.
```

Not allowed:

```txt
V2.0.0 adds a core V1 feature that should have been required for V1 stability.
V3.0.0 fixes basic V2 architecture that was never completed.
```

## 7. Current project state before V1

Current estimated state:

```txt
V1 technical progress: about 65%
V1 publishable progress: about 50-55%
```

Already implemented or documented:

```txt
motion-core architecture
MotionDefinition
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
composition compiler
composition builder
composition runtime shortcuts
composition block offset placement
composition item labels
motion-web driver
motion-pack-basic
vanilla example
custom MotionDefinition guide
custom MotionDriver guide
composition API guide
```

Main missing V1 family:

```txt
timeline sampling
playback state
seek/progress controls
reverse/backward playback model
playback rate controls
advanced playback events
timeline inspection
V1 docs and publication readiness
```

## 8. V1 objective

V1 must be the first stable public version.

V1 promise:

```txt
A framework-agnostic TypeScript animation engine that can define, compose,
validate, plan, inspect and control animations through a stable core API,
with an official Web driver and a documented extension model.
```

V1 should not be a prototype.

V1 should be good enough to use in real projects such as:

```txt
Structifyx
Sondatio
visual builders
Angular applications
React applications
vanilla Web applications
plugin-based platforms
```

## 9. V1 required feature set

V1 is not complete until all items in this section are implemented, tested and documented.

### 9.1 Core architecture and public contracts

Required status for V1:

```txt
MotionDefinition stable
MotionDriver stable
MotionEngine stable
MotionTimelineDefinition stable
MotionCompositionDefinition stable
MotionPlaybackController stable
MotionPlaybackResult stable
MotionExecutionPlan stable
```

Rules:

```txt
No major public API uncertainty before V1.
No breaking changes without deciding before V1 freeze.
All public exports must be intentional.
```

### 9.2 Timeline builder and direct timeline API

Required status for V1:

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

V1 acceptance:

```txt
Users can build serializable timelines without writing raw objects.
Raw MotionTimelineDefinition remains the canonical runtime model.
```

### 9.3 Motion definitions and options DX

Required status for V1:

```txt
SchemaMotionDefinition
defineMotionOptions()
option.number()
option.range()
option.string()
option.boolean()
option.select()
option.color()
InferMotionOptions
optionValidators
numeric validators
```

V1 acceptance:

```txt
External developers can create custom motions with clear typing, defaults, validation and tests.
```

### 9.4 Composition API

Required status for V1:

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

V1 acceptance:

```txt
Users can compose registered motions and direct timelines.
Compositions compile to MotionTimelineDefinition.
Composition is not a second runtime.
```

V1 does not require:

```txt
nested composition groups
composition-specific reduced motion
composition presets
advanced composition diagnostics object model
```

These are V2 or V1.x candidates depending on size.

### 9.5 Timeline Sampler

Required for V1.

Purpose:

```txt
Compute timeline state at a specific time or progress without playing the animation.
```

Required APIs:

```txt
sampleMotionTimeline(timeline, input)
sampleMotionTimelineAtTime(timeline, time)
sampleMotionTimelineAtProgress(timeline, progress)
```

Required output should include:

```txt
time
progress
duration
active tracks
active steps
sampled keyframe values
completed steps
pending steps
```

V1 acceptance:

```txt
The core can answer: what should this animation look like at 350ms?
The sampler works without DOM, WAAPI or platform APIs.
The sampler is tested with labels, anchors, block offsets, stagger, delays and multiple tracks.
```

### 9.6 Playback state

Required for V1.

Purpose:

```txt
Expose current playback position and runtime state in a platform-neutral way.
```

Required model:

```txt
MotionPlaybackState
```

Required fields:

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

V1 acceptance:

```txt
A playback controller can expose its state.
A UI can display a progress bar and current time.
```

### 9.7 Playback Controller V1 advanced controls

Required for V1.

Current controller already supports:

```txt
pause()
resume()
cancel()
finish()
dispose()
events
```

V1 must add or finalize:

```txt
getState()
seek(time)
seekProgress(progress)
jumpToLabel(label)
setPlaybackRate(rate)
playForward()
playBackward() or reverse()
```

V1 acceptance:

```txt
Users can move to a specific millisecond.
Users can move to a progress value.
Users can jump to a label.
Users can change speed.
Users can play backward at least in the supported driver/runtime path.
Unsupported controls return skipped, not fake success.
```

### 9.8 Advanced playback events

Required minimum for V1:

```txt
onUpdate
onProgress
onSeek
onPlaybackRateChange
onReverse
```

V1 optional if time allows:

```txt
onStepStart
onStepFinish
onTrackStart
onTrackFinish
onLabelEnter
onLabelLeave
```

V1 acceptance:

```txt
A builder or debug UI can listen to playback progress and seek changes.
```

### 9.9 Timeline inspector

Required for V1.

Purpose:

```txt
Analyze a timeline without playing it.
```

Required API:

```txt
inspectMotionTimeline(timeline)
```

Required output:

```txt
total duration
track count
step count
labels
anchors usage
stagger usage
animated properties
performance warnings
accessibility warnings
infinite duration flag
```

V1 acceptance:

```txt
Developers can understand what a timeline contains before playing it.
A future visual builder can use this output.
```

### 9.10 Accessibility and performance baseline

Required for V1:

```txt
reduced motion support remains stable
infinite playback finish behavior remains safe
performance diagnostics remain available
basic accessibility warnings exist in inspectMotionTimeline()
```

V1 does not require full WCAG/RGAA automation.

V1 should include first-level warnings for:

```txt
infinite animations
large movement
filter-heavy animations
layout-risk properties
missing reduced motion path when relevant
```

### 9.11 Web driver V1

Required for V1:

```txt
WebMotionDriver remains official driver
Element target support
self / child / selector / named target resolution
WAAPI execution
conflict strategy
reduced motion
controller support
advanced controls where possible
```

V1 acceptance:

```txt
The official Web driver supports the V1 controller features where technically possible.
Unsupported features must return skipped with explicit reasons.
```

### 9.12 Basic motion pack V1

Required for V1:

```txt
fade-in
fade-out
slide-in
```

Optional for V1:

```txt
scale-in
scale-out
zoom-in
zoom-out
rotate-in
blur-in
```

Rule:

```txt
Do not delay V1 only to add many effects.
The engine is more important than effect quantity.
```

### 9.13 Documentation and publication

Required for V1:

```txt
README public
installation guide
quickstart
core concepts
MotionDefinition guide
MotionDriver guide
Composition API guide
Timeline Sampler guide
Playback Controller guide
Web driver guide
migration / versioning policy
known limitations
examples
```

Required publication files:

```txt
LICENSE
CHANGELOG.md
package metadata
exports checked
npm package names confirmed
release checklist
```

## 10. V1 release checklist

V1 can be published when this checklist is complete.

```txt
[ ] Public API reviewed and frozen for V1
[ ] motion-core tests pass
[ ] motion-web tests pass
[ ] motion-pack-basic tests pass
[ ] examples build pass
[ ] Timeline Sampler implemented and tested
[ ] Playback state implemented and tested
[ ] seek(time) implemented and tested
[ ] seekProgress(progress) implemented and tested
[ ] jumpToLabel(label) implemented and tested
[ ] reverse/playBackward minimal implemented and tested
[ ] setPlaybackRate(rate) implemented and tested
[ ] advanced events minimum implemented and tested
[ ] inspectMotionTimeline() implemented and tested
[ ] Web driver supports or safely skips advanced controls
[ ] docs updated
[ ] README ready
[ ] CHANGELOG ready
[ ] npm package exports reviewed
[ ] version tags ready
```

## 11. V1.x policy

V1.x versions improve V1 without changing the V1 promise.

Allowed in V1.x:

```txt
small improvements to sampler
small playback controller improvements
additional playback events related to V1
additional validation warnings
more basic motions
better docs
better examples
small helper APIs
performance improvements
bug fixes
```

Not allowed in V1.x:

```txt
large plugin ecosystem
visual editor/devtools product
major driver ecosystem expansion
new architecture that changes the core runtime model
breaking API redesign without a major version
```

## 12. V1.x example roadmap

### 12.1 V1.1.0 - Playback polish

Possible features:

```txt
onStepStart
onStepFinish
onTrackStart
onTrackFinish
onLabelEnter
onLabelLeave
better currentLabel detection
better controller state snapshots
```

### 12.2 V1.2.0 - Timeline inspector improvements

Possible features:

```txt
more accessibility warnings
more performance warnings
animated property grouping
human-readable timeline summary
inspection metadata for builders
```

### 12.3 V1.3.0 - More basic motions

Possible features:

```txt
scale-in
scale-out
zoom-in
zoom-out
blur-in
rotate-in
```

Rule:

```txt
Only add motions that use the existing V1 core model.
```

### 12.4 V1.4.0 - Composition improvements related to V1

Possible features:

```txt
structured composition diagnostics
better item label diagnostics
composition validation helpers
composition preview helpers using sampler
```

### 12.5 V1.5.0 - Stability and developer experience

Possible features:

```txt
better error messages
better TypeScript helper types
better docs examples
API reference cleanup
compatibility test suite
```

### 12.6 V1.5.x patch releases

Examples:

```txt
1.5.1 fixes a seek bug
1.5.2 fixes a Web driver controller edge case
1.5.10 fixes several reported bugs without adding features
```

## 13. V2 objective

V2 should introduce a new major capability family after V1 is stable.

Recommended V2 theme:

```txt
Advanced orchestration, modular runtime and builder-ready intelligence.
```

V2 should not finish missing V1 controls. Those must already exist in V1.

## 14. V2 major feature candidates

### 14.1 Nested composition groups

V2 candidate.

Purpose:

```txt
Compose groups of motions as reusable blocks.
```

Example:

```ts
composition.group(
  {
    label: 'card-sequence',
    at: 300
  },
  (group) => {
    group.motion('fade-in');
    group.motion('slide-in', { at: 150 });
  }
);
```

Required V2 behavior:

```txt
group offset
group labels
nested placement
group defaults
group target override
group validation
group compilation to MotionTimelineDefinition
```

### 14.2 Composition reduced motion

V2 candidate.

Purpose:

```txt
Compile a normal composition timeline and a reduced-motion composition timeline.
```

Possible API:

```txt
compileMotionComposition(composition, {
  registry,
  reducedMotion: true
})
```

Behavior:

```txt
call buildReducedMotionTimeline when available
fallback safely when not available
preserve item timing where possible
report diagnostics for missing reduced alternatives
```

### 14.3 Structured diagnostics model

V2 candidate.

Purpose:

```txt
Make all important errors machine-readable for builders, AI tools and devtools.
```

Examples:

```txt
itemIndex
trackIndex
stepIndex
label
motionType
optionName
suggestedFix
```

### 14.4 Timeline constraints

V2 candidate.

Purpose:

```txt
Allow applications and builders to enforce rules.
```

Example:

```ts
validateMotionTimeline(timeline, {
  constraints: {
    maxDuration: 3000,
    forbidInfinite: true,
    requireReducedMotionFallback: true
  }
});
```

Use cases:

```txt
accessibility-first products
enterprise design systems
builder-safe animation policies
performance budgets
```

### 14.5 Semantic motion metadata

V2 candidate.

Purpose:

```txt
Describe the intention and risk profile of motions.
```

Examples:

```txt
intent: entrance | exit | feedback | attention | loading | transition
vestibularRisk: low | medium | high
flashingRisk: none | low | high
reducedMotionRecommended: true
```

Use cases:

```txt
AI-assisted motion generation
builder recommendations
accessibility warnings
automatic reduced-motion strategy
motion catalog organization
```

### 14.6 Dynamic engine event subscriptions

V2 candidate.

Possible API:

```ts
const unsubscribe = motion.on('play', (event) => {});
```

Use cases:

```txt
devtools
builder preview
runtime plugins
analytics
logging
```

## 15. V2 release checklist

V2 can be started only after V1 is stable.

```txt
[ ] V1 API stable
[ ] V1 docs complete
[ ] V1 published or internally frozen
[ ] V1 advanced playback controls complete
[ ] V1 sampler complete
[ ] V1 inspector complete
[ ] V2 RFC written
[ ] Breaking changes listed
[ ] Migration guide planned
```

V2 can be released when:

```txt
[ ] nested groups are implemented or explicitly postponed
[ ] structured diagnostics implemented
[ ] composition reduced motion implemented or explicitly scoped out
[ ] constraints or semantic metadata implemented
[ ] V2 docs complete
[ ] V1 migration guide complete if needed
```

## 16. V2.x policy

V2.x improves V2 features.

Allowed:

```txt
more group features
more diagnostics
more constraints
more semantic metadata
more builder-focused helpers
```

Not allowed:

```txt
starting V3 product ecosystem before V2 core is stable
```

## 17. V3 objective

V3 should move beyond core engine capability into ecosystem-level power.

Recommended V3 theme:

```txt
Ecosystem, plugins, devtools, marketplace and multi-platform expansion.
```

V3 should be considered only after V1 and V2 core capabilities are stable.

## 18. V3 major feature candidates

### 18.1 Plugin ecosystem

Possible features:

```txt
motion plugin manifests
motion packs metadata
plugin discovery
plugin validation
plugin version compatibility
plugin capability declarations
```

### 18.2 Presets and variants system

Possible features:

```txt
motion presets
composition presets
variants
style/design-system mappings
brand motion tokens
```

Example:

```txt
fade-in.subtle
fade-in.strong
card-enter.default
modal-enter.accessible
```

### 18.3 Motion devtools core protocol

Possible features:

```txt
devtools event stream
playback inspection protocol
timeline debugging protocol
snapshot comparison
timeline diff
performance panel data
accessibility panel data
```

### 18.4 Multi-platform official drivers

Possible official packages:

```txt
motion-debug
motion-canvas
motion-react-native
motion-svg
motion-lottie
```

Rule:

```txt
Do not start broad driver ecosystem work before the core playback model is stable.
```

### 18.5 Builder integration layer

Possible features:

```txt
builder-safe schemas
inspector metadata
property editors metadata
drag-to-timeline helpers
AI prompt-safe schemas
export/import pipelines
```

### 18.6 AI-assisted motion tooling

Possible features:

```txt
motion explanation
motion generation
motion optimization suggestions
accessibility suggestions
semantic-to-timeline compiler
natural language to composition
```

This should not be part of V1.

## 19. V3 release checklist

V3 should not start until:

```txt
[ ] V1 stable
[ ] V2 stable
[ ] core APIs proven in real projects
[ ] at least one real application uses the engine
[ ] extension points are validated
[ ] plugin/devtools RFC exists
```

## 20. What is explicitly out of V1

To keep V1 achievable, these are out of V1 unless explicitly moved back in:

```txt
full visual builder
AI motion generator
large driver ecosystem
React Native official driver
Canvas official driver
plugin marketplace
nested composition groups
full devtools UI
full accessibility automation
full semantic motion catalog
large preset system
```

V1 may prepare architecture for these, but should not try to complete them.

## 21. Recommended immediate path from now

Current next steps toward V1:

```txt
1. Timeline Sampler
2. Playback state model
3. seek(time)
4. seekProgress(progress)
5. jumpToLabel(label)
6. reverse/playBackward minimal
7. setPlaybackRate(rate)
8. advanced playback events minimum
9. inspectMotionTimeline()
10. V1 docs/publication cleanup
```

Recommended first implementation phase:

```txt
Phase Core Playback 1 - Timeline Sampler
```

Why:

```txt
seek depends on sampling
progress depends on sampling
snapshots depend on sampling
inspectors can reuse sampling ideas
builder preview depends on sampling
future drivers become easier when sampling exists
```

## 22. Release naming recommendation

Before public V1, use pre-1.0 releases:

```txt
0.2.0 - Timeline Sampler
0.3.0 - Playback state + seek/progress
0.4.0 - reverse + playbackRate + events
0.5.0 - inspector + docs cleanup
0.6.0 - beta public candidate
1.0.0 - stable V1
```

After V1:

```txt
1.1.0 - V1 improvement features
1.1.1 - bugfix
1.3.0 - mini features related to V1
1.5.10 - bugfixes after V1.5.0
2.0.0 - new major V2 feature family
3.0.0 - ecosystem-level V3 feature family
```

## 23. Final decision rule

Before adding any feature, ask:

```txt
Is this required for V1 stability?
  If yes, do it before V1.

Is this a small improvement directly tied to V1?
  If yes, it can be V1.x.

Is this a new major capability family?
  If yes, move it to V2.

Is this ecosystem/product expansion?
  If yes, move it to V3.
```

This rule keeps the project powerful without becoming endless.
