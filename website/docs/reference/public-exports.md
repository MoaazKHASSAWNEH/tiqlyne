---
sidebar_position: 23
---

# Public exports

Import only from package roots. Internal source paths are not package exports.

## @tiqlyne/motion-core

Engine and registry:

- `createMotionEngine`, `MotionEngineConfig`, `MotionEngine`, `DefaultMotionEngine`, `DefaultMotionEngineDependencies`
- `MotionRegistry`, `DefaultMotionRegistry`, `MotionConfigNormalizer`, `DefaultMotionConfigNormalizer`
- `MotionConfig`, `NormalizedMotionConfig`, `MotionEngineError`, `MotionPlanningError`

Definitions and options:

- `MotionDefinition`, `MotionBuildContext`, `BaseMotionDefinition`, `SchemaMotionDefinition`
- `defineMotionOptions`, `DefinedMotionOptions`, `InferMotionOptions`, `MotionOptionsSchema`, `normalizeMotionOptions`
- `option`, `attachMotionOptionName`, option schema/definition/choice types
- `runMotionOptionValidators`, `validateIncreasing`, `validateDecreasing`, `validateDifferent`, `validateGreaterThan`, `validateGreaterThanOrEqual`, `validateLessThan`, `validateLessThanOrEqual`

Timelines and composition:

- `createMotionTimeline`, `createMotionTimelineBuilder`, timeline/track/step builder types
- timeline, target, keyframe, easing, transform, filter, defaults, position, stagger, direction, and iteration types
- `createMotionComposition`, `MotionCompositionBuilder`, `compileMotionComposition`, composition definition/item/context/input types
- `resolveMotionStepPosition`, `applyMotionStepDefaults`, `applyMotionTimelineDefaults`, `hasMotionTimelineDefaults`, `mergeMotionTimelineDefaults`, `prepareMotionTimeline`

Planning, validation, and scheduling:

- `validateMotionTimeline`, `MotionValidationResult`, validation/performance types
- `createMotionExecutionPlan`, `createMotionExecutionPlanSummary`, `scheduleMotionTimeline`
- execution-plan, prepared-timeline, scheduled-timeline, and summary types
- `normalizeMotionTimelinePlayOptions`, `MotionTimelinePlayOptions`

Drivers, controllers, results, and events:

- `MotionDriver`, `MotionPlayOptions`, `NoopMotionDriver`, `TestMotionDriver`, `TestMotionDriverCall`
- `MotionPlaybackController`, `BaseMotionPlaybackController`, `PromiseMotionPlaybackController`, controller/state/status types
- `MotionPlaybackResult`, `MotionPlaybackResultReasons`, playback result reason/status types
- `MotionPlaybackEventTypes` and playback event/listener/type types
- `MotionEngineEventTypes`, `MotionEngineEventSources`, engine event/source/payload/callback types

Diagnostics and tooling:

- `MotionDiagnosticCodes`, `MotionDiagnosticSources`, diagnostic types and creation helpers
- playback diagnostic helpers for invalid input, invalid transition, unsupported operations, and failed operations
- `sampleMotionTimeline`, `sampleMotionTimelineAtTime`, `sampleMotionTimelineAtProgress`, and sample types
- `inspectMotionTimeline` and inspection types

Core also exports focused normalization/type-guard utilities such as `clamp`, `isRecord`, `normalizeBoolean`, `normalizeNumber`, `normalizeString`, trigger/conflict guards and value arrays, and keyframe performance-tier helpers.

## @tiqlyne/motion-web

- `WebMotionDriver`, `WebMotionDriverOptions`, `WebMotionPlaybackController`, `motionWebVersion`
- `toWebKeyframes`, `toWebStepTimingOptions`, `toWebScheduledTaskTimingOptions`
- `resolveWebTarget`, `resolveWebTargets`, `resolveWebTrackTargets`, `resolveStaggerOffset`
- `createWebAnimationFromStep`, `createWebAnimationsFromScheduledTask`, timeline animation helpers and result types
- Web playback-result helpers: `createFailedWebPlayback`, `createFinishedWebPlayback`, `createResolvedWebPlayback`, `createSkippedWebPlayback`
- reduced-motion helpers: generic fallback diagnostic, simplify/resolve timeline, diagnostics, plan, and schedule helpers
- conflict helpers: `cancelWebAnimations`, `getEffectiveWebConflictStrategy`, `hasActiveWebAnimations`, `isActiveWebAnimation`
- `shouldValidateWebPlayableTimeline`, `validateWebPlayableTimeline`, and its result type

## @tiqlyne/motion-pack-basic

- `FadeInMotion`, `FadeInMotionOptions`
- `FadeOutMotion`, `FadeOutMotionOptions`
- `SlideInMotion`, `SlideInMotionOptions`, `SlideInDirection`
- `registerBasicMotions`, `motionPackBasicVersion`

This list targets version 0.1.0. See the package `src/index.ts` files as the source of truth when upgrading.

## Related pages

- [Core package](../packages/motion-core.md)
- [Web package](../packages/motion-web.md)
- [Basic pack reference](./basic-pack.md)
- [API stability](../release/api-stability.md)
