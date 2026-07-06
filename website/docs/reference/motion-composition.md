---
sidebar_position: 5
---

# Motion composition

A motion composition combines registered motions into a larger sequence.

It is an authoring layer that compiles to a timeline.

## Role

Compositions make it easier to combine reusable motions without writing low-level timeline steps manually.

A composition depends on the motion registry because every motion type must be resolved to a registered definition.

## Main workflow

The usual workflow is:

1. create a composition;
2. add registered motions;
3. compile it to a timeline or play it through the engine.

## Engine APIs

The engine exposes composition-specific methods:

- playComposition
- planComposition
- createCompositionPlayback

## Use cases

Compositions are useful for animation sequences, reusable transitions, higher-level authoring and future visual builder workflows.

## Definition shape

`MotionCompositionDefinition` contains required `items` and optional `defaults` and `labels`. An item is either `{ kind: 'motion', type, ... }` or `{ kind: 'timeline', timeline, ... }`; both may specify `label`, `target`, `at`, and `defaults`, while registered motion items additionally accept `options`.

The builder exposes `defaults`, `label`, `labels`, `motion`, `timeline`, and `build`. `compileMotionComposition(composition, { registry, defaults?, validation? })` resolves motion definitions and returns a `MotionTimelineDefinition`.

Registered items normalize and validate options, then build the definition timeline. Direct timeline items bypass registry lookup. Item target/default/position overrides are applied while the tracks and labels are merged into the compiled timeline.

Compilation can throw `MotionPlanningError` with composition-specific codes such as `composition-empty`, `composition-duplicate-label`, `composition-item-label-anchor-position-unsupported`, `composition-item-label-reference-missing`, `composition-item-unknown-motion-type`, `composition-item-invalid-options`, and `composition-invalid-timeline`. `planComposition` keeps this throwing planning behavior; `playComposition` converts planning failures into failed results using the code as the reason.

Common mistakes are compiling with a different registry than the engine, confusing item `label` with a predeclared timeline label, and using a composition where one direct timeline would be clearer.

## Related pages

- [Compositions guide](../guides/compositions.md)
- [Composition builder](./composition-builder.md)
- [Composition example](../examples/composition.md)
