# Tiqlyne Motion Engine - MotionDefinition DX audit

> Status: architecture RFC.
>
> Scope: `@tiqlyne/motion-core` developer experience for creating reusable registered motions.
>
> Goal: make motion creation easier and safer without duplicating existing core models, without weakening the timeline API, and without breaking existing classes.

## 1. Why this document exists

Before writing a guide about custom `MotionDefinition` classes, the project needs to stabilize the recommended way to create reusable motions.

The current architecture is solid, but creating a motion can require repetitive code:

- option metadata for the builder;
- default option values;
- option normalization from `Record<string, unknown>`;
- simple option validation;
- the actual timeline construction.

This document audits the current `motion-core` structure and proposes a DX layer that removes repetition while preserving the explicit class-based model and the full power of `createMotionTimeline()`.

## 2. Non-goals

This RFC does not propose to replace the current engine architecture.

It does not introduce animation-specific timeline shortcuts such as:

- `timeline.fade()`;
- `fadeTimeline()`;
- `motionRecipe.fade()`;
- `motionRecipe.slide()`.

The timeline builder should remain the normal way to describe timelines. Multi-track and multi-step timelines must remain fully supported.

This RFC also does not propose decorators, runtime reflection, external schema libraries, or DOM/WAAPI coupling inside `motion-core`.

## 3. Current core structure audit

The public exports show that `motion-core` already has clearly separated responsibilities:

- `contracts/` contains public interfaces such as `MotionDefinition`, `MotionEngine`, `MotionDriver`, `MotionRegistry`, and `MotionConfigNormalizer`.
- `models/` contains pure data types such as `MotionConfig`, `MotionTimelineDefinition`, `MotionOptionDefinition`, `MotionPlaybackResult`, diagnostics, triggers, conflicts, and timeline play options.
- `base/` contains abstract base classes such as `BaseMotionDefinition`.
- `builders/` contains the timeline builder API: `createMotionTimeline`, timeline builder, track builder, and step builder.
- `utils/` contains small pure helpers such as `normalizeNumber`, `normalizeBoolean`, `normalizeString`, `clamp`, and `isRecord`.
- `validators/` contains timeline, target, easing, keyframe, filter, transform, stagger, and playback validation utilities.
- `normalizer/` contains `DefaultMotionConfigNormalizer` for `MotionConfig`.
- `engine/` contains `DefaultMotionEngine`, `createMotionEngine`, planning errors, and timeline play options normalization.
- `compiler/`, `planner/`, and `scheduler/` contain timeline preparation, defaults, planning, execution plan summaries, and scheduling.
- `registry/`, `drivers/`, and `controllers/` contain registry, driver, and playback controller implementations.

The new DX layer must fit into this structure instead of creating a parallel architecture.

## 4. Existing elements that must be reused

### 4.1 `MotionDefinition`

`MotionDefinition<TOptions>` is the existing contract for reusable registered motions.

It already defines the required shape:

- `type`;
- `label`;
- `description`;
- `category`;
- `optionDefinitions`;
- `getDefaultOptions()`;
- `normalizeOptions()`;
- optional `validateOptions()`;
- `buildTimeline()`;
- optional `buildReducedMotionTimeline()`.

This contract should stay the canonical low-level API.

### 4.2 `BaseMotionDefinition`

`BaseMotionDefinition<TOptions>` is the explicit advanced class API.

It should remain compatible and unchanged for advanced use cases. Developers who need full control must still be able to extend it directly.

### 4.3 `MotionOptionDefinition`

`MotionOptionDefinition` already exists in `models/motion-option-definition.ts` and supports these option types:

- `number`;
- `range`;
- `string`;
- `boolean`;
- `select`;
- `color`.

The DX layer must not create a second option model. It should generate and consume the existing `MotionOptionDefinition` union.

### 4.4 Normalization utilities

The core already has small helpers:

- `normalizeNumber()`;
- `normalizeBoolean()`;
- `normalizeString()`;
- `clamp()`;
- `isRecord()`.

The new option normalization layer should reuse these helpers instead of duplicating low-level normalization logic.

### 4.5 Timeline builder

`createMotionTimeline()` already provides the full timeline API.

The builder supports:

- timeline-level `defaults()`;
- timeline labels;
- multiple tracks;
- track-level defaults;
- track-level stagger;
- multiple steps per track;
- step options;
- `keyframe()`;
- `keyframes()`;
- `from()`;
- `to()`.

This API should remain the recommended way to express animation timelines.

## 5. Problems to solve

### 5.1 Repeated option information

In many motions, the same option information is repeated in several places:

- `optionDefinitions` describes labels, defaults, limits, units, and choices;
- `getDefaultOptions()` repeats default values;
- `normalizeOptions()` repeats default values and constraints;
- `validateOptions()` may repeat simple invariants.

The project should move toward a single source of truth for options.

### 5.2 Class creation is explicit but verbose

The class model is desirable because it is readable and explicit, but basic motions currently require too much boilerplate.

The target experience should keep explicit classes while making the repetitive parts internal.

### 5.3 Avoid timeline shortcut fragmentation

Animation-specific shortcuts such as `fadeTimeline()` would create two ways to express the same timeline.

The project should not hide the timeline model. Developers should continue to use `createMotionTimeline()` so they retain multi-track, multi-step, labels, defaults, stagger, positions, reduced motion timelines, and all current engine features.

## 6. Architecture decision

The project should introduce a small DX layer focused on motion options and class ergonomics.

The recommended future model is:

```txt
MotionDefinition
  remains the canonical low-level contract.

BaseMotionDefinition
  remains the advanced explicit class API.

SchemaMotionDefinition
  becomes the recommended class API for most custom motions.

defineMotionOptions()
  becomes the single source of truth for option definitions, defaults, and normalization.

createMotionTimeline()
  remains the normal timeline construction API.
```

The DX layer must not reduce engine features. It must only reduce boilerplate around `MotionDefinition` creation.

## 7. Proposed files after structure audit

### 7.1 New `options/` folder

A new `options/` folder is justified because option schema building is a specific domain that does not currently exist.

It must use existing models and utilities.

Proposed files:

```txt
packages/motion-core/src/options/motion-option-builders.ts
packages/motion-core/src/options/define-motion-options.ts
packages/motion-core/src/options/infer-motion-options.ts
packages/motion-core/src/options/normalize-motion-options.ts
packages/motion-core/src/options/motion-option-validator.ts
```

Responsibilities:

- `motion-option-builders.ts`: exposes typed builders such as `option.number()`, `option.boolean()`, `option.string()`, `option.select()`, `option.range()`, and `option.color()`.
- `define-motion-options.ts`: converts an option schema object into a reusable option schema definition with definitions, defaults, and normalization.
- `infer-motion-options.ts`: exposes `InferMotionOptions<TSchema>` to derive runtime option types from the schema.
- `normalize-motion-options.ts`: normalizes raw options using the existing `normalizeNumber`, `normalizeBoolean`, and `normalizeString` utilities.
- `motion-option-validator.ts`: provides generic validators for common invariants, while preserving the current `validateOptions(): ReadonlyArray<string>` behavior.

### 7.2 New `base/schema-motion-definition.ts`

This file belongs in `base/`, not in a new `definitions/` folder, because it is a base class for motion definitions.

Proposed file:

```txt
packages/motion-core/src/base/schema-motion-definition.ts
```

Responsibility:

- implement `MotionDefinition<TOptions>`;
- expose `optionDefinitions` from the schema;
- implement `getDefaultOptions()` from the schema;
- implement `normalizeOptions()` from the schema;
- run optional validators;
- keep `buildTimeline()` explicit and implemented by the concrete motion class.

### 7.3 Future optional `factories/define-motion.ts`

A functional factory can be added later:

```txt
packages/motion-core/src/factories/define-motion.ts
```

This should not be implemented first. The class-based path should be validated first because the project wants classes to remain the recommended and explicit approach.

## 8. Files that should not be created now

The following folders or files should not be created in the first implementation:

```txt
packages/motion-core/src/definitions/
packages/motion-core/src/schemas/
packages/motion-core/src/recipes/
packages/motion-core/src/normalizers/
```

Reasons:

- `definitions/` would overlap with `contracts/` and `base/`.
- `schemas/` is too generic and could become a parallel validation system.
- `recipes/` would encourage animation-specific timeline shortcuts, which this RFC rejects.
- `normalizers/` would conflict conceptually with the existing `normalizer/` folder and `utils/normalize-*` helpers.

## 9. Target developer experience

### 9.1 Recommended class-based API

```ts
const fadeInOptions = defineMotionOptions({
  fromOpacity: option.number({
    label: 'Start opacity',
    defaultValue: 0,
    min: 0,
    max: 1
  }),

  toOpacity: option.number({
    label: 'End opacity',
    defaultValue: 1,
    min: 0,
    max: 1
  })
});

type FadeInOptions = InferMotionOptions<typeof fadeInOptions>;

export class FadeInMotion extends SchemaMotionDefinition<typeof fadeInOptions> {
  readonly type = 'fade-in';
  readonly label = 'Fade In';
  readonly description = 'Fade an element in by animating opacity.';
  readonly category = 'entrance' as const;

  protected readonly options = fadeInOptions;

  protected readonly validators = [
    validateDifferent('fromOpacity', 'toOpacity', 'fromOpacity and toOpacity must be different.')
  ];

  buildTimeline({ options }: MotionBuildContext<FadeInOptions>) {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step((step) => {
          step.from({ opacity: options.fromOpacity });
          step.to({ opacity: options.toOpacity });
        });
      });
    });
  }
}
```

### 9.2 Advanced API remains valid

Developers can still use `BaseMotionDefinition<TOptions>` directly when they need full manual control.

### 9.3 Functional API comes later

A future `defineMotion()` can return a `MotionDefinition<TOptions>` object for simple motions, but it should reuse the same option schema infrastructure.

## 10. Type and validation constraints

The implementation must preserve these rules:

- no `any`;
- TypeScript strict mode compatible;
- `exactOptionalPropertyTypes` compatible;
- no DOM, WAAPI, Angular, React, or GSAP inside `motion-core`;
- no runtime reflection;
- no decorators;
- no external schema library;
- no duplicate option model;
- no duplicate timeline builder;
- `validateOptions()` should remain compatible with the current `ReadonlyArray<string>` contract in the first iteration.

A future richer diagnostic model for motion option validation can be considered separately, but it should not be bundled into the first DX implementation.

## 11. Implementation order

Recommended order:

1. Add option builders and schema types.
2. Add `defineMotionOptions()`.
3. Add `InferMotionOptions`.
4. Add `normalizeMotionOptions()`.
5. Add tests for number, range, string, boolean, select, and color options.
6. Add `SchemaMotionDefinition`.
7. Add tests for `optionDefinitions`, defaults, normalization, and validators.
8. Migrate `FadeInMotion` as a proof of concept.
9. Validate build, typecheck, and tests.
10. Migrate `FadeOutMotion`.
11. Migrate `SlideInMotion`.
12. Add `defineMotion()` only after the class-based API has proven stable.

## 12. Validation checklist

The first implementation is acceptable only if:

- existing motions using `BaseMotionDefinition` still compile;
- existing registry APIs still accept old and new motion definitions;
- `createMotionTimeline()` remains unchanged;
- multi-track and multi-step timelines remain unchanged;
- generated option definitions are compatible with the existing `MotionOptionDefinition` union;
- defaults are generated from the same option schema used for builder metadata;
- normalization reuses existing utilities where possible;
- tests cover all supported option types;
- no public API forces the functional style over classes.

## 13. Summary decision

The project should make motion creation easier by improving the `MotionDefinition` authoring experience, not by hiding timelines.

The selected direction is:

```txt
Keep the current engine and timeline model.
Keep BaseMotionDefinition for advanced classes.
Add defineMotionOptions() as the option single source of truth.
Add SchemaMotionDefinition as the recommended comfortable class base.
Do not add animation-specific timeline shortcuts.
Add defineMotion() later as an optional functional API.
```

This keeps the engine explicit, powerful, testable, and comfortable for developers who will create many reusable motion classes.
