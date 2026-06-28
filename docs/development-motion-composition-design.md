# Motion Composition and Orchestration Design

> Status: design proposal.
> Purpose: define the next core feature for composing multiple registered motions and direct timelines into one serializable timeline.
> Scope: `motion-core` design only. No DOM, WAAPI, Angular, React, GSAP or browser API.
> Last verified state: after the custom MotionDefinition DX work and the documentation alignment around `SchemaMotionDefinition`.

## 1. Problem to solve

The engine already supports two powerful usage modes:

```txt
registered motion
  motion.play(target, { type, options })

direct timeline
  motion.playTimeline(target, timeline)
```

The missing layer is a professional authoring API for combining multiple motions into one coordinated animation.

Examples the engine should support later:

```txt
- fade in, then slide in
- animate title, cards and CTA with offsets
- run multiple registered motions on different targets
- create reusable entrance sequences
- compile a builder-authored sequence into a serializable timeline
- preview and store composed animations in a database
```

The current low-level `MotionTimelineDefinition` is already strong enough to represent tracks, steps, labels, anchors, defaults and stagger. The missing feature is an authoring/compiler layer that can produce that timeline from reusable motion definitions.

## 2. Design principle

The composition system must not become a second animation engine.

Core rule:

```txt
Composition API -> compiler -> MotionTimelineDefinition
```

`MotionTimelineDefinition` remains the single serializable source of truth.

The composition API is only a higher-level authoring convenience.

## 3. Goals

The feature should make it easy to:

```txt
- compose registered MotionDefinition instances
- compose direct MotionTimelineDefinition values
- target each composed item independently
- configure duration, delay, easing and timing per item
- use labels and anchors for positioning
- validate every composed motion before compiling
- produce one final MotionTimelineDefinition
- keep output compatible with the existing engine pipeline
- keep motion-core platform-agnostic
- support future builder UI and database storage
```

## 4. Non-goals

This feature should not introduce:

```txt
- DOM querying in motion-core
- Web Animations API calls in motion-core
- React/Angular/Vue concepts
- ScrollTrigger-like behavior
- FLIP/layout measurement
- animation-specific shortcuts like timeline.fade()
- a second runtime execution path
- function-based values in the final serialized timeline
```

Scroll, layout, DOM measurement and framework integrations belong in separate packages.

## 5. Current architecture compatibility

The current architecture already has the right low-level pieces:

```txt
MotionDefinition
  Reusable registered motion contract.

MotionRegistry
  Stores and resolves MotionDefinition instances by type.

MotionBuildContext
  Provides normalized options and timing context to buildTimeline().

MotionTimelineDefinition
  Serializable timeline output.

createMotionTimeline()
  Existing low-level timeline builder.

validateMotionTimeline()
  Existing timeline validation.

prepareMotionTimeline()
  Existing preparation step.

scheduleMotionTimeline()
  Existing scheduling step.

createMotionExecutionPlan()
  Existing execution plan step.
```

The composition compiler should reuse these pieces instead of replacing them.

## 6. Proposed public model

### 6.1 MotionCompositionDefinition

A composition is a serializable authoring document.

```ts
export type MotionCompositionDefinition = {
  readonly defaults?: MotionTimelineDefaults;
  readonly labels?: MotionTimelineLabels;
  readonly items: ReadonlyArray<MotionCompositionItem>;
};
```

The name `MotionCompositionDefinition` is preferred over `MotionSequenceDefinition` because the feature should support both sequential and parallel orchestration.

A sequence is only one kind of composition.

### 6.2 MotionCompositionItem

A composition item can reference a registered motion or a direct timeline.

```ts
export type MotionCompositionItem =
  | RegisteredMotionCompositionItem
  | TimelineCompositionItem;
```

### 6.3 RegisteredMotionCompositionItem

```ts
export type RegisteredMotionCompositionItem = {
  readonly kind: 'motion';
  readonly type: string;
  readonly target?: MotionTargetReference;
  readonly options?: Record<string, unknown>;
  readonly at?: MotionStepPosition;
  readonly label?: string;
  readonly defaults?: MotionTimelineDefaults;
};
```

Field meaning:

```txt
kind
  Discriminator. Must be 'motion'.

type
  Registered motion type, for example fade-in or slide-in.

target
  Target to apply to the compiled timeline tracks.
  Defaults to self.

options
  Raw options passed to the MotionDefinition.
  They are normalized by the motion definition.

at
  Optional placement for the first compiled step.
  Uses the existing MotionStepPosition model.

label
  Optional label to attach to the compiled position.

defaults
  Timing/default overrides for this item.
```

### 6.4 TimelineCompositionItem

```ts
export type TimelineCompositionItem = {
  readonly kind: 'timeline';
  readonly timeline: MotionTimelineDefinition;
  readonly target?: MotionTargetReference;
  readonly at?: MotionStepPosition;
  readonly label?: string;
  readonly defaults?: MotionTimelineDefaults;
};
```

Use this when the caller already has a low-level timeline.

## 7. Proposed authoring API

### 7.1 Object API

The lowest-risk API is a plain object.

```ts
const composition: MotionCompositionDefinition = {
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  },
  items: [
    {
      kind: 'motion',
      type: 'fade-in',
      options: {
        fromOpacity: 0,
        toOpacity: 1
      }
    },
    {
      kind: 'motion',
      type: 'slide-in',
      at: {
        anchor: 'previous-end'
      },
      options: {
        direction: 'bottom',
        distance: 24,
        fade: false
      }
    }
  ]
};
```

This is builder-friendly and database-friendly.

### 7.2 Builder API

A builder can be added as a convenience on top of the object model.

```ts
const composition = createMotionComposition((composition) => {
  composition.motion('fade-in', {
    options: {
      fromOpacity: 0,
      toOpacity: 1
    },
    defaults: {
      duration: 200
    }
  });

  composition.motion('slide-in', {
    at: {
      anchor: 'previous-end'
    },
    options: {
      direction: 'bottom',
      distance: 24,
      fade: false
    },
    defaults: {
      duration: 300
    }
  });
});
```

Important rule:

```txt
The builder returns a MotionCompositionDefinition.
The compiler accepts a MotionCompositionDefinition.
```

The object model must remain the canonical representation.

## 8. Proposed compiler API

### 8.1 compileMotionComposition()

```ts
export function compileMotionComposition(
  composition: MotionCompositionDefinition,
  context: CompileMotionCompositionContext
): MotionTimelineDefinition;
```

Context:

```ts
export type CompileMotionCompositionContext = {
  readonly registry: MotionRegistry;
  readonly defaults?: MotionTimelineDefaults;
};
```

The compiler needs a registry because registered motion items must resolve their `MotionDefinition` by type.

### 8.2 Why not add it directly to MotionEngine first?

Do not start by adding `motion.playComposition()`.

Start with a pure compiler:

```txt
MotionCompositionDefinition
  -> compileMotionComposition()
  -> MotionTimelineDefinition
  -> existing motion.playTimeline()
```

This keeps the first implementation small, testable and compatible with the existing pipeline.

A future convenience API can be added later:

```ts
motion.playComposition(target, composition, options);
motion.createCompositionPlayback(target, composition, options);
motion.planComposition(composition, options);
```

But those are phase 2.

## 9. Compilation behavior

### 9.1 Registered motion item compilation

For each `kind: 'motion'` item:

```txt
1. Resolve MotionDefinition from registry.
2. If missing, return or throw a planning error with code unknown-motion-type.
3. Normalize item.options with definition.normalizeOptions().
4. Validate normalized options with definition.validateOptions().
5. Build a MotionBuildContext.
6. Call definition.buildTimeline(context).
7. Apply item target override to compiled tracks if provided.
8. Apply item defaults / timing placement to first or all compiled steps according to rules.
9. Merge compiled tracks into the final timeline.
```

### 9.2 Timeline item compilation

For each `kind: 'timeline'` item:

```txt
1. Use the provided MotionTimelineDefinition.
2. Optionally apply target override.
3. Optionally apply item defaults.
4. Optionally apply item placement.
5. Merge tracks into the final timeline.
```

### 9.3 Output

The compiler must return:

```ts
MotionTimelineDefinition
```

The output should be valid input for:

```ts
motion.playTimeline(target, compiledTimeline);
motion.planTimeline(compiledTimeline);
validateMotionTimeline(compiledTimeline);
prepareMotionTimeline(compiledTimeline);
scheduleMotionTimeline(compiledTimeline);
createMotionExecutionPlan(compiledTimeline);
```

## 10. Placement rules

The current timeline model already supports `MotionStepPosition`:

```txt
number
string
label position
anchor position
```

Composition should reuse it.

Examples:

```ts
{
  kind: 'motion',
  type: 'fade-in',
  at: 0
}

{
  kind: 'motion',
  type: 'slide-in',
  at: {
    anchor: 'previous-end'
  }
}

{
  kind: 'motion',
  type: 'pulse',
  at: {
    label: 'cta-visible',
    offset: 100
  }
}
```

Recommended phase 1 rule:

```txt
item.at applies to the first step of every compiled track for that item.
```

This is simple and predictable.

Advanced per-step remapping can wait.

## 11. Target rules

A composed item may specify `target`.

If omitted:

```txt
target defaults to self
```

If provided:

```txt
The compiler rewrites the target of every compiled track in that item to the provided target.
```

Example:

```ts
{
  kind: 'motion',
  type: 'slide-in',
  target: {
    type: 'selector',
    selector: '.card'
  },
  options: {
    direction: 'bottom',
    distance: 24,
    fade: true
  }
}
```

This keeps registered motions reusable because most custom motions can build tracks against `self` and let the composition decide the real target.

## 12. Defaults and timing rules

There are three levels of defaults:

```txt
composition.defaults
  Applied to the final timeline defaults.

item.defaults
  Applied to the compiled timeline or compiled steps for a specific item.

motion defaults / build context
  Used by the MotionDefinition when building its own timeline.
```

Recommended phase 1 behavior:

```txt
1. Build the motion with a MotionBuildContext created from merged composition + item defaults.
2. Preserve explicit values generated by the motion.
3. Do not override explicit values in compiled steps.
4. Set final timeline.defaults from composition.defaults.
```

This preserves the existing rule:

```txt
Defaults must not override explicit timeline, track or step values.
```

## 13. Labels

Composition may define global labels:

```ts
const composition: MotionCompositionDefinition = {
  labels: {
    start: 0,
    heroVisible: 400
  },
  items: []
};
```

Items may also attach labels.

```ts
{
  kind: 'motion',
  type: 'fade-in',
  label: 'hero-visible'
}
```

Recommended phase 1 behavior:

```txt
- composition.labels are copied to final timeline.labels.
- item.label can be converted to a label at item.at if item.at is numeric.
- if item.at is not numeric, item.label support can be postponed.
```

To keep phase 1 small, item labels may be optional and limited.

## 14. Validation and diagnostics

The composition compiler should detect:

```txt
- empty composition items
- unknown registered motion type
- invalid normalized motion options
- invalid compiled timeline
- invalid item target
- invalid item placement
- duplicate labels
```

Phase 1 can throw `MotionPlanningError`, matching the existing planning behavior.

Future phase can return structured composition diagnostics.

Potential diagnostic codes:

```txt
composition-empty
composition-item-unknown-motion-type
composition-item-invalid-options
composition-item-invalid-timeline
composition-item-invalid-target
composition-item-invalid-position
composition-duplicate-label
```

## 15. Reduced motion

Composition should not invent a new reduced motion system.

Recommended behavior:

```txt
- A registered motion item delegates reduced motion behavior to its MotionDefinition when the engine chooses reduced motion strategy.
- A timeline item keeps its provided timeline.
- The compiler should not read matchMedia or platform settings.
```

In phase 1, composition compiles normal timelines only.

Reduced motion remains handled by the existing engine/driver pipeline.

If later the engine needs `buildReducedMotionTimeline()` during compilation, add a compiler option:

```ts
export type CompileMotionCompositionContext = {
  readonly registry: MotionRegistry;
  readonly defaults?: MotionTimelineDefaults;
  readonly reducedMotion?: boolean;
};
```

Do not add it until the runtime path needs it.

## 16. Conflict strategy

Composition should not directly manage runtime conflicts.

Conflict strategy remains a playback concern:

```txt
MotionTimelinePlayOptions
MotionEngineConfig
WebMotionDriver conflict behavior
```

The composition compiler only produces a timeline.

## 17. Serialization

`MotionCompositionDefinition` should be JSON-safe.

Allowed:

```txt
strings
numbers
booleans
objects
arrays
null when already allowed by existing model
```

Not allowed in the canonical definition:

```txt
functions
DOM references
class instances
Animation objects
Element objects
Map/Set
Date objects
```

This keeps compositions compatible with:

```txt
builder UI
CMS/database storage
AI generation
migration/versioning
preview/runtime separation
```

## 18. File layout proposal

Recommended files:

```txt
packages/motion-core/src/composition/motion-composition-definition.ts
packages/motion-core/src/composition/create-motion-composition.ts
packages/motion-core/src/composition/motion-composition-builder.ts
packages/motion-core/src/composition/compile-motion-composition.ts
packages/motion-core/src/composition/compile-motion-composition.spec.ts
packages/motion-core/src/composition/create-motion-composition.spec.ts
```

Exports from:

```txt
packages/motion-core/src/index.ts
```

Do not create files under:

```txt
packages/motion-core/src/recipes/
packages/motion-core/src/presets/
packages/motion-core/src/shortcuts/
```

Composition is a core authoring/compiler feature, not an animation recipe feature.

## 19. Suggested type draft

```ts
export type MotionCompositionDefinition = {
  readonly defaults?: MotionTimelineDefaults;
  readonly labels?: MotionTimelineLabels;
  readonly items: ReadonlyArray<MotionCompositionItem>;
};

export type MotionCompositionItem =
  | RegisteredMotionCompositionItem
  | TimelineCompositionItem;

export type RegisteredMotionCompositionItem = {
  readonly kind: 'motion';
  readonly type: string;
  readonly target?: MotionTargetReference;
  readonly options?: Record<string, unknown>;
  readonly at?: MotionStepPosition;
  readonly label?: string;
  readonly defaults?: MotionTimelineDefaults;
};

export type TimelineCompositionItem = {
  readonly kind: 'timeline';
  readonly timeline: MotionTimelineDefinition;
  readonly target?: MotionTargetReference;
  readonly at?: MotionStepPosition;
  readonly label?: string;
  readonly defaults?: MotionTimelineDefaults;
};
```

## 20. Suggested builder draft

```ts
const composition = createMotionComposition((composition) => {
  composition.defaults({
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  });

  composition.label('start', 0);

  composition.motion('fade-in', {
    at: 'start',
    options: {
      fromOpacity: 0,
      toOpacity: 1
    }
  });

  composition.motion('slide-in', {
    at: {
      anchor: 'previous-end'
    },
    options: {
      direction: 'bottom',
      distance: 24,
      fade: false
    }
  });
});
```

Expected output shape:

```txt
MotionCompositionDefinition
```

Then:

```ts
const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

## 21. Implementation phases

### Phase 1: pure object compiler

```txt
- Add MotionCompositionDefinition types.
- Add compileMotionComposition().
- Support registered motion items.
- Support direct timeline items.
- Support item target override.
- Support item at placement on first step of each compiled track.
- Support composition defaults.
- Throw MotionPlanningError for unknown motion and invalid options.
- Add tests.
```

No engine methods yet.

### Phase 2: builder convenience

```txt
- Add createMotionComposition().
- Add MotionCompositionBuilder.
- Add builder tests.
- Keep object model canonical.
```

### Phase 3: engine convenience methods

Potential methods:

```ts
playComposition(target, composition, options?)
createCompositionPlayback(target, composition, options?)
planComposition(composition, options?)
```

Only add these after the compiler is stable.

### Phase 4: examples

```txt
- Add a vanilla example using a local custom motion.
- Add a vanilla example compiling a composition and playing it through playTimeline().
```

### Phase 5: advanced authoring

```txt
- Structured composition diagnostics.
- Better label attachment.
- Better reduced motion compilation path if needed.
- Composition presets.
- Builder UI metadata integration.
```

## 22. Test plan

Required tests for phase 1:

```txt
compile empty composition -> error
compile unknown motion -> error
compile motion with invalid options -> error
compile one registered motion -> timeline
compile two registered motions sequentially -> timeline with positions
compile direct timeline item -> merged timeline
compile target override -> all tracks rewritten
compile composition defaults -> final timeline.defaults
compile item defaults -> explicit step values preserved
compile labels -> final labels preserved
```

Required tests for phase 2:

```txt
builder creates empty composition
builder adds defaults
builder adds labels
builder adds registered motion item
builder adds timeline item
builder preserves item order
builder output equals object model
```

## 23. Open questions

Questions to decide before implementation:

```txt
1. Should unknown motion type throw MotionPlanningError or return a validation result?
2. Should item.defaults apply to build context only, or also to compiled steps after build?
3. Should item.at apply to every track first step or only the first track?
4. Should item.label be supported in phase 1 or postponed?
5. Should compileMotionComposition validate the final timeline automatically?
6. Should direct timeline items allow target override, or should direct timelines be treated as already complete?
```

Recommended answers for phase 1:

```txt
1. Throw MotionPlanningError.
2. Apply item.defaults to build context; do not override explicit compiled values.
3. Apply item.at to the first step of every compiled track for that item.
4. Support composition.labels first; postpone item.label if it complicates labels.
5. Yes, validate final timeline before returning.
6. Allow target override because it is useful and predictable.
```

## 24. Recommended next action

Before writing code, validate this design against the current source files:

```txt
packages/motion-core/src/contracts/motion-definition.ts
packages/motion-core/src/contracts/motion-registry.ts
packages/motion-core/src/engine/motion-planning-error.ts
packages/motion-core/src/models/motion-timeline.ts
packages/motion-core/src/builders/create-motion-timeline.ts
packages/motion-core/src/validators/validate-motion-timeline.ts
```

Then implement phase 1 only.

Do not implement builder, engine convenience methods, scroll, FLIP or presets in the same step.
