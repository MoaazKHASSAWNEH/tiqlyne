# Structifyx Motion Engine - Current API Status

> Status: documentation addendum.
> Purpose: keep the developer documentation aligned with the current implementation after the engine events, skip event and Web driver quickstart documentation.
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
- skip lifecycle event through onSkip
- Web driver quickstart documentation
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
Skip event: implemented
Web driver documentation: quickstart available
Plugin/preset documentation: partial
Integration guides: first Web quickstart available
Versioning policy: not yet implemented
```

The previous wording `Event system: not yet implemented` is obsolete.

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
    onSkip(event) {},
    onError(event) {}
  }
});
```

For the complete event references and Web quickstart, see:

```txt
docs/engine-events-api.md
docs/skip-event-api.md
docs/web-driver-quickstart.md
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

The current event system exposes seven callbacks:

```txt
onBeforePlan
onPlan
onPlay
onFinish
onCancel
onSkip
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

`onSkip` is emitted for controlled skipped results such as disabled registered motions, unknown registered motion types, and unsupported driver control operations.

`onError` is emitted by `play()` and `playTimeline()` when they catch planning or runtime errors and return a failed `MotionPlaybackResult`.

Direct calls to `plan()` and `planTimeline()` still throw directly and do not currently emit `onError` when they fail.

## 5. Important event limits

The current implementation deliberately does not include:

```txt
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

## 6. Skip event summary

`onSkip` observes skipped operations.

Current skip reasons:

```txt
motion-disabled
unknown-motion-type
driver-cancel-not-supported
driver-finish-not-supported
driver-reset-not-supported
```

Expected event orders:

```txt
motion-disabled
  onSkip

unknown-motion-type
  onSkip

driver-cancel-not-supported
  onSkip -> onCancel

driver-finish-not-supported
  onSkip

driver-reset-not-supported
  onSkip
```

Invalid timelines are not skips. They remain planning errors and are observed through `onError` when using `play()` or `playTimeline()`.

For the complete skip reference, see:

```txt
docs/skip-event-api.md
```

## 7. Web driver quickstart summary

The Web driver documentation now explains how to use:

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
```

The Web driver quickstart is based on audited current code behavior:

```txt
- WebMotionDriver implements MotionDriver<Element>.
- WebMotionDriver exposes reducedMotion and cancelPreviousAnimations options.
- Web target resolution supports self, child, selector and named targets.
- Web keyframe conversion maps numeric lengths to px and numeric angles to deg.
- Web timing conversion maps iterations, direction, endDelay and playbackRate.
- Reduced motion skip/simplify behavior is documented.
- Conflict behavior for ignore, replace and cancelPreviousAnimations is documented.
```

For the complete Web reference, see:

```txt
docs/web-driver-quickstart.md
```

## 8. Current documentation map

The current documentation files have the following roles:

```txt
docs/developer-api-guide.md
  Main developer guide and broad API overview.

docs/developer-api-guide-current-status.md
  Current status addendum for the main guide.

docs/engine-events-api.md
  Detailed reference for global engine events.

docs/skip-event-api.md
  Detailed reference for the onSkip lifecycle event.

docs/web-driver-quickstart.md
  Audited quickstart for motion-core + motion-web usage.

docs/development-architecture-audit.md
  Internal architecture audit and technical analysis.

docs/development-direct-api-design.md
  Direct API design notes and implementation order.

docs/project-handoff.md
  Reprise/handoff document for future work.
```

This addendum should be used as the current status correction for the main guide until the documentation is split into smaller pages.

## 9. Current completed milestones

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
10. docs: add current API status addendum
11. feat(core): add skip event
12. docs: document skip event behavior
13. docs: add web driver quickstart
```

The current implementation has moved beyond a pure prototype. It is now a strong developer API foundation.

## 10. Recommended next technical steps

Recommended next steps after the Web driver quickstart:

```txt
1. docs: add examples using motion-core + motion-web together
2. docs: add writing a custom MotionDefinition guide
3. docs: add writing a custom MotionDriver guide
4. feat(core): add dynamic event subscription API later, for example motion.on(...)
5. docs: split the large developer guide into concepts/api/guides pages
```

## 11. Rules to preserve

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

## 12. Local validation reminder

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
