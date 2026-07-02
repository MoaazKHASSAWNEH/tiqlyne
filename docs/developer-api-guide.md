# Structifyx Motion Engine - Developer API Guide

> Status: current developer-facing overview.
> Purpose: explain the public API and point developers to the detailed guides.
> Last verified state: after `77f3beb docs(core): add tsdoc to engine factory and base definitions`.

For the most complete hands-on usage document, read:

```txt
docs/complete-usage-guide.md
```

For project resumption in another ChatGPT discussion, read:

```txt
docs/chatgpt-project-resume.md
docs/project-handoff.md
```

## 1. Executive summary

Structifyx Motion Engine is a framework-agnostic TypeScript motion engine.

It lets developers:

```txt
- define reusable animations
- build serializable timelines
- compose animations
- validate timelines
- create execution plans
- inspect timelines
- sample timelines
- play animations through platform drivers
- control playback through controllers
```

The most important architectural rule:

```txt
motion-core defines, validates, plans, schedules, samples and inspects motion.
drivers execute motion on concrete platforms.
```

`motion-core` must stay independent from:

```txt
DOM
Web Animations API
CSSStyleDeclaration
Angular
React
GSAP
browser-only APIs
```

## 2. Packages

### 2.1 `@structifyx/motion-core`

Responsible for platform-independent behavior:

```txt
contracts
models
registry
normalization
validation
defaults
planning
scheduling
execution plans
composition
sampler
inspector
diagnostics
playback controller contracts
base controller utilities
test/noop drivers
custom motion definition helpers
```

### 2.2 `@structifyx/motion-web`

Responsible for browser execution:

```txt
WebMotionDriver
DOM target resolution
Motion keyframe -> Web keyframe conversion
Motion timing -> KeyframeAnimationOptions conversion
Web Animations API playback
reduced-motion behavior
conflict strategy behavior
WebMotionPlaybackController
```

### 2.3 `@structifyx/motion-pack-basic`

Contains reusable motion definitions:

```txt
fade-in
fade-out
slide-in
```

These motions currently use:

```txt
SchemaMotionDefinition
defineMotionOptions()
InferMotionOptions
option validators
```

## 3. Main usage modes

The engine supports these usage modes:

```txt
1. Registered MotionConfig playback
2. Direct MotionTimelineDefinition playback
3. MotionCompositionDefinition playback
4. Timeline sampling without playback
5. Timeline inspection without playback
6. Playback controller runtime control
7. Custom MotionDefinition creation
8. Custom MotionDriver creation
```

## 4. Creating an engine

```ts
import { createMotionEngine } from '@structifyx/motion-core';
import { WebMotionDriver } from '@structifyx/motion-web';

const motion = createMotionEngine({
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

`createMotionEngine()` is the recommended entry point. Most users should not instantiate `DefaultMotionEngine` directly.

## 5. Registering and playing reusable motions

```ts
import { registerBasicMotions } from '@structifyx/motion-pack-basic';

registerBasicMotions(motion);

await motion.play(element, {
  id: 'hero-slide',
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 48,
    fade: true
  }
});
```

The registered motion flow:

```txt
MotionConfig
  -> normalizer
  -> registry.get(type)
  -> definition.normalizeOptions()
  -> definition.validateOptions()
  -> definition.buildTimeline()
  -> defaults
  -> validation
  -> execution plan
  -> driver.play()
```

## 6. Direct timeline playback

```ts
import { createMotionTimeline } from '@structifyx/motion-core';

const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 300 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(element, timeline);
```

`MotionTimelineDefinition` remains the serializable runtime source of truth. The builder is a convenience API only.

## 7. Compositions

A composition is an authoring/orchestration model.

```txt
MotionCompositionDefinition
  -> compileMotionComposition()
  -> MotionTimelineDefinition
  -> playTimeline() / planTimeline() / createTimelinePlayback()
```

Example:

```ts
import { createMotionComposition } from '@structifyx/motion-core';

const composition = createMotionComposition((composition) => {
  composition.motion({
    type: 'fade-in',
    label: 'intro',
    at: 0
  });

  composition.motion({
    type: 'slide-in',
    at: { label: 'intro', offset: 200 },
    options: {
      direction: 'bottom',
      distance: 24,
      fade: true
    }
  });
});

await motion.playComposition(element, composition);
```

Composition is not a second runtime.

## 8. Playback controllers

Use controllers for runtime control.

```ts
const controller = motion.createTimelinePlayback(element, timeline);

await controller.seek(150);
await controller.seekProgress(0.5);
await controller.jumpToLabel('content');
await controller.setPlaybackRate(1.5);
await controller.playBackward();
```

Current controller API:

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

State fields:

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

## 9. Timeline sampler

Sampling reads a timeline at a time or progress without playing it.

```ts
import { sampleMotionTimelineAtProgress } from '@structifyx/motion-core';

const sample = sampleMotionTimelineAtProgress(timeline, 0.5);
```

Use it for:

```txt
previews
scrubbers
tests
visual builders
controller state support
```

## 10. Timeline inspector

Inspection returns a developer-friendly report.

```ts
import { inspectMotionTimeline } from '@structifyx/motion-core';

const report = inspectMotionTimeline(timeline);
```

The report includes:

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

## 11. Diagnostics and result reasons

Diagnostics explain details. Result reasons summarize outcomes.

Important exports:

```txt
MotionDiagnostic
MotionDiagnosticCodes
MotionDiagnosticSources
MotionPlaybackResultReasons
createMotionDiagnostic()
createMotionWarningDiagnostic()
createMotionErrorDiagnostic()
createMotionInfoDiagnostic()
```

A result can include diagnostics:

```ts
const result = await motion.playTimeline(element, timeline);

for (const diagnostic of result.diagnostics ?? []) {
  console.log(diagnostic.level, diagnostic.code, diagnostic.message);
}
```

## 12. Custom motion definitions

Recommended API:

```txt
SchemaMotionDefinition
defineMotionOptions()
option.*
InferMotionOptions
MotionOptionValidator
createMotionTimeline()
```

Detailed guide:

```txt
docs/writing-custom-motion-definition.md
```

## 13. Custom drivers

A driver is a platform execution adapter. It is not an animation definition.

Detailed guide:

```txt
docs/writing-custom-motion-driver.md
```

## 14. Validation commands

```bash
pnpm format
pnpm test
pnpm typecheck
pnpm build
```

Targeted build:

```bash
pnpm --filter @structifyx/motion-core build
```

## 15. Current status and next phase

Current status:

```txt
Phase V1 Refactor 9 - TSDoc public API: completed.
Validation complete: OK.
```

Next phase:

```txt
Phase V1 Refactor 10 - finalisation release V1 package
```

Phase 10 should focus on:

```txt
README
CHANGELOG
package.json publication metadata
exports/types/files audit
pnpm pack checks
release checklist
final documentation examples audit
```

Do not start a visual builder, Angular/React adapter or plugin marketplace before V1 release readiness is complete.
