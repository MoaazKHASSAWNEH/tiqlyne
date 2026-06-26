# Structifyx Motion Engine - Current API Status

> Status: documentation addendum.
> Purpose: keep the developer documentation aligned with the current implementation after the engine events feature.
> Scope: documentation only. No source code change is included in this document.

## 1. Why this addendum exists

`docs/developer-api-guide.md` is the main developer-facing guide, but it was originally written while some features were still in progress.

The engine has since evolved. In particular, the following features are now implemented and should be considered part of the current documented API foundation:

```txt
- timeline builder API
- direct timeline playback API
- createMotionEngine() facade
- engine defaults
- engine validation options
- engine registry helpers
- motion-pack-basic using createMotionTimeline() internally
- global engine events through createMotionEngine({ events })
```

This document clarifies the current state until the main guide is reorganized into smaller official documentation pages.

## 2. Current maturity level

The current maturity status should be read as:

```txt
Architecture foundation: strong
Core / driver separation: strong
Direct API usability: good
Registry workflow: good
Global config: first version ready
Event system: first version implemented
Plugin/preset documentation: partial
Integration guides: not yet implemented
Versioning policy: not yet implemented
```

The previous wording `Event system: not yet implemented` is now obsolete.

The first event system version is implemented as global engine listeners configured through:

```ts
const motion = createMotionEngine({
  driver,
  events: {
    onBeforePlan(event) {},
    onPlan(event) {},
    onPlay(event) {},
    onFinish(event) {},
    onCancel(event) {},
    onError(event) {}
  }
});
```

For the complete event reference, see:

```txt
docs/engine-events-api.md
```

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

## 4. Event system summary

The current event system exposes six callbacks:

```txt
onBeforePlan
onPlan
onPlay
onFinish
onCancel
onError
```

The event source is one of:

```txt
registered-motion
  The event comes from motion.play(target, config).

direct-timeline
  The event comes from motion.playTimeline(target, timeline) or motion.planTimeline(timeline).
```

Successful registered motion playback order:

```txt
onBeforePlan
onPlan
onPlay
onFinish
```

Successful direct timeline playback order:

```txt
onBeforePlan
onPlan
onPlay
onFinish
```

Planning-only calls emit only planning events:

```txt
onBeforePlan
onPlan
```

`onError` is emitted by `play()` and `playTimeline()` when they catch planning or runtime errors and return a failed `MotionPlaybackResult`.

Direct calls to `plan()` and `planTimeline()` still throw directly and do not currently emit `onError` when they fail.

## 5. Important event limits

The current implementation deliberately does not include:

```txt
- onSkip
- onProgress
- onPause
- onResume
- onRepeat
- onReverse
- onSeek
- onStepStart
- onStepFinish
- onTrackStart
- onTrackFinish
- onEveryFrame
- dynamic motion.on(...) subscriptions
- unsubscribe support
```

Those features should not be documented as available until they are implemented and tested.

## 6. Current documentation map

The current documentation files have the following roles:

```txt
docs/developer-api-guide.md
  Main developer guide and broad API overview.

docs/developer-api-guide-current-status.md
  Current status addendum for the main guide.

docs/engine-events-api.md
  Detailed reference for global engine events.

docs/development-architecture-audit.md
  Internal architecture audit and technical analysis.

docs/development-direct-api-design.md
  Direct API design notes and implementation order.

docs/project-handoff.md
  Reprise/handoff document for future work.
```

This addendum should be used as the current status correction for the main guide until the documentation is split into smaller pages.

## 7. Current completed milestones

The completed milestones are now:

```txt
1. feat(core): add timeline builder API
2. feat(core): add direct timeline playback API
3. feat(core): add createMotionEngine facade
4. feat(core): add engine defaults and validation config
5. feat(core): add engine registry helpers
6. docs: add developer API guide and audit
7. refactor(pack-basic): use timeline builder
8. feat(core): add global playback event listeners
9. docs: document engine events API
```

The current implementation has moved beyond a pure prototype. It is now a strong developer API foundation.

## 8. Recommended next technical steps

Recommended next steps after the documentation update:

```txt
1. feat(core): add onSkip event
2. docs: document onSkip behavior once implemented
3. docs: add web driver quickstart
4. docs: add examples using motion-core + motion-web together
5. docs: add writing a custom MotionDefinition guide
6. docs: add writing a custom MotionDriver guide
7. feat(core): add dynamic event subscription API later, for example motion.on(...)
```

## 9. Recommended next code feature: onSkip

`onSkip` is the next clean lifecycle event candidate.

It would cover cases that currently return early before the full planning/playback lifecycle starts:

```txt
- motion disabled
- unknown registered motion type
- driver cancel not supported
- driver finish not supported
- driver reset not supported
```

A possible first shape could be:

```ts
type MotionSkipReason =
  | 'motion-disabled'
  | 'unknown-motion-type'
  | 'driver-cancel-not-supported'
  | 'driver-finish-not-supported'
  | 'driver-reset-not-supported';

type MotionSkipEvent<TTarget = unknown> = {
  readonly type: 'skip';
  readonly target?: TTarget;
  readonly source?: MotionEngineEventSource;
  readonly motionId?: string;
  readonly motionType?: string;
  readonly reason: MotionSkipReason;
  readonly result: MotionPlaybackResult;
  readonly timestamp: number;
};
```

This is only a proposal. The code should not be changed from this document alone without a dedicated implementation step and tests.

## 10. Rules to preserve

The following rules remain important:

```txt
- motion-core must stay framework-agnostic.
- motion-core must not import DOM, WAAPI, Angular, React or GSAP.
- MotionTimelineDefinition remains the serializable source of truth.
- createMotionTimeline() is a builder convenience, not a replacement for the model.
- createMotionEngine() is the public factory.
- DefaultMotionEngine is an implementation detail for most users.
- Engine defaults must not override timeline, track or step values.
- Per-play validation must override engine validation.
- Events are observational.
- Optional properties must be omitted rather than set to undefined.
```

## 11. Local validation reminder

Documentation-only changes should still be pulled locally and formatted.

Recommended local commands:

```bash
git pull
pnpm format
pnpm build
pnpm typecheck
pnpm -r --workspace-concurrency=1 test
```

The build and tests should still pass because this document does not change source code.
