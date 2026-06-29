# Motion Composition API

> Status: current public API guide.
> Scope: `@structifyx/motion-core` composition API.
> Audience: users creating composed animations from registered motions and direct timelines.
> Runtime support: a composition is compiled to a timeline, then executed through the existing timeline pipeline.

## 1. Purpose

The composition API lets users describe a coordinated animation made from multiple items:

```txt
registered motions
existing direct timelines
multiple targets
timing overrides
composition labels
item labels
placement values
```

A composition is an authoring object. It is not a second runtime.

The core flow is:

```txt
createMotionComposition()
  -> MotionCompositionDefinition
  -> compileMotionComposition()
  -> MotionTimelineDefinition
  -> motion.playTimeline()
```

The engine also exposes convenience methods:

```txt
motion.planComposition()
motion.playComposition()
motion.createCompositionPlayback()
```

These methods are shortcuts over the same compiler and timeline pipeline.

## 2. Main APIs

```ts
createMotionComposition(callback): MotionCompositionDefinition
new MotionCompositionBuilder().build(): MotionCompositionDefinition
compileMotionComposition(composition, context): MotionTimelineDefinition
motion.planComposition(composition, options?): MotionExecutionPlan
motion.playComposition(target, composition, options?): Promise<MotionPlaybackResult>
motion.createCompositionPlayback(target, composition, options?): MotionPlaybackController
```

The builder API is optional. The object model remains the canonical representation.

## 3. Architecture rule

The important rule is:

```txt
composition -> compiler -> timeline -> existing engine runtime
```

That means:

```txt
composition = authoring layer
compileMotionComposition = compiler layer
MotionTimelineDefinition = runtime format
MotionEngine = existing execution pipeline
MotionDriver = platform execution
```

Composition does not bypass timeline validation, planning, scheduling, conflict handling, reduced-motion runtime behavior, or driver execution.

## 4. Canonical object model

A composition is a serializable object:

```ts
const composition: MotionCompositionDefinition = {
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  },
  labels: {
    start: 0
  },
  items: [
    {
      kind: 'motion',
      type: 'fade-in',
      label: 'card-enter',
      at: 'start',
      options: {
        fromOpacity: 0,
        toOpacity: 1
      }
    },
    {
      kind: 'motion',
      type: 'slide-in',
      at: {
        label: 'card-enter',
        offset: 150
      },
      options: {
        direction: 'bottom',
        distance: 32,
        fade: false
      }
    }
  ]
};
```

This format is safe for:

```txt
builder UI
database storage
JSON serialization
AI generation
migration/versioning
preview/runtime separation
```

## 5. Builder usage

```ts
const composition = createMotionComposition((composition) => {
  composition.defaults({
    duration: 450,
    easing: 'ease-out',
    fill: 'both'
  });

  composition.label('start', 0);

  composition.motion('fade-in', {
    label: 'card-enter',
    at: 'start',
    options: {
      fromOpacity: 0,
      toOpacity: 1
    },
    defaults: {
      duration: 250
    }
  });

  composition.motion('slide-in', {
    at: {
      label: 'card-enter',
      offset: 150
    },
    options: {
      direction: 'bottom',
      distance: 32,
      fade: false
    },
    defaults: {
      duration: 450
    }
  });
});
```

The returned value is still only:

```ts
MotionCompositionDefinition;
```

The builder stores data. It does not compile or play the animation.

## 6. Manual compilation usage

Registered motion items require a registry.

```ts
const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);

const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

`compileMotionComposition()` returns a `MotionTimelineDefinition` that can be passed to existing APIs:

```ts
motion.playTimeline(target, timeline);
motion.createTimelinePlayback(target, timeline);
motion.planTimeline(timeline);
```

Use manual compilation when you want to inspect, store, cache, validate, or transform the compiled timeline before playback.

## 7. Runtime convenience usage

The engine can compile a composition internally using its registry.

```ts
await motion.playComposition(element, composition);
```

Equivalent explicit flow:

```ts
const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

The convenience API is useful when the caller does not need to inspect the compiled timeline.

### 7.1 planComposition()

```ts
const plan = motion.planComposition(composition);
```

Behavior:

```txt
1. Compile the composition with the engine registry.
2. Pass the compiled timeline to planTimeline().
3. Return the MotionExecutionPlan.
```

This does not play anything.

### 7.2 playComposition()

```ts
const result = await motion.playComposition(element, composition);
```

Behavior:

```txt
1. Compile the composition with the engine registry.
2. Pass the compiled timeline to playTimeline().
3. Return the MotionPlaybackResult.
```

If compilation fails, the method returns a failed playback result.

Example:

```txt
status: failed
reason: composition-item-unknown-motion-type
```

### 7.3 createCompositionPlayback()

```ts
const playback = motion.createCompositionPlayback(element, composition);
```

Behavior:

```txt
1. Compile the composition with the engine registry.
2. Pass the compiled timeline to createTimelinePlayback().
3. Return the MotionPlaybackController.
```

If the driver supports native playback creation, the native controller path is used.

If the driver does not support native playback creation, the existing fallback controller behavior is used through the timeline pipeline.

## 8. Registered motion items

A registered motion item references a `MotionDefinition` by type.

```ts
composition.motion('fade-in', {
  label: 'card-enter',
  at: 300,
  options: {
    fromOpacity: 0,
    toOpacity: 1
  }
});
```

Equivalent object form:

```ts
{
  kind: 'motion',
  type: 'fade-in',
  label: 'card-enter',
  at: 300,
  options: {
    fromOpacity: 0,
    toOpacity: 1
  }
}
```

Compilation behavior:

```txt
1. Resolve the motion from the registry by type.
2. Normalize options with definition.normalizeOptions().
3. Validate options with definition.validateOptions(), when available.
4. Build a MotionBuildContext.
5. Call definition.buildTimeline(context).
6. Apply composition item overrides.
7. Merge the produced tracks into the final timeline.
8. Add the optional item label to the final timeline labels.
9. Validate the final compiled timeline.
```

If the motion type is missing from the registry, compilation throws a `MotionPlanningError` with code:

```txt
composition-item-unknown-motion-type
```

If options are invalid, compilation throws a `MotionPlanningError` with code:

```txt
composition-item-invalid-options
```

## 9. Direct timeline items

A direct timeline item embeds an existing `MotionTimelineDefinition`.

```ts
composition.timeline(existingTimeline, {
  label: 'hero-timeline',
  at: 100,
  target: {
    type: 'selector',
    selector: '.hero'
  }
});
```

Equivalent object form:

```ts
{
  kind: 'timeline',
  timeline: existingTimeline,
  label: 'hero-timeline',
  at: 100,
  target: {
    type: 'selector',
    selector: '.hero'
  }
}
```

Compilation behavior:

```txt
1. Read tracks from the provided timeline.
2. Apply optional target override.
3. Apply optional item defaults.
4. Apply optional placement as a block offset.
5. Add the optional item label to the final timeline labels.
6. Merge tracks into the final timeline.
7. Validate the final compiled timeline.
```

Direct timeline items do not require registry lookup.

## 10. Defaults behavior

There are three composition/compiler default layers.

```txt
context.defaults
composition.defaults
item.defaults
```

There is also a separate engine default layer applied later by `planTimeline()` / `playTimeline()`.

### 10.1 context.defaults

`context.defaults` is passed to `compileMotionComposition()`:

```ts
compileMotionComposition(composition, {
  registry,
  defaults: {
    duration: 500,
    easing: 'linear'
  }
});
```

It is used as a base layer for the final compiled timeline defaults.

Runtime convenience methods do not pass engine defaults into `compileMotionComposition()`, because engine defaults are already applied by the timeline planning pipeline.

### 10.2 composition.defaults

`composition.defaults` is the default timing layer for the composition.

```ts
composition.defaults({
  duration: 450,
  easing: 'ease-out',
  fill: 'both'
});
```

It is copied to the final compiled timeline defaults, merged over `context.defaults`.

### 10.3 item.defaults

`item.defaults` applies to a specific item.

For registered motion items, it affects the `MotionBuildContext` used by the motion definition.

```ts
composition.motion('fade-in', {
  defaults: {
    duration: 250
  }
});
```

For direct timeline items, it is applied to the item's steps as fallback timing values.

### 10.4 Merge order

The effective build context for a registered motion item is resolved in this order:

```txt
item.defaults
composition.defaults
context.defaults
internal fallback
```

More specific values win.

Item defaults do not become global timeline defaults.

## 11. Explicit values are preserved

Defaults are fallback values.

They must not overwrite explicit step values generated by a motion definition or direct timeline.

Example:

```txt
composition.defaults.duration = 500
item.defaults.duration = 200
compiled step duration = 150
```

The step keeps:

```txt
duration = 150
```

This matches the existing timeline default behavior: explicit step values win over defaults.

## 12. Target behavior

Each item may provide a target override.

```ts
composition.motion('slide-in', {
  target: {
    type: 'selector',
    selector: '.card'
  }
});
```

If an item has a target override, every compiled track for that item receives the override target.

If an item does not provide a target, the compiler preserves the track target produced by the motion or direct timeline.

If the produced track does not have a target, the compiler falls back to:

```ts
{
  type: 'self';
}
```

`self` means the runtime target passed to `motion.playTimeline()` or `motion.playComposition()`.

```ts
await motion.playComposition(element, composition);
```

So a track with `{ type: 'self' }` resolves to `element` in the Web driver.

## 13. Placement behavior with `at`

Each item may provide `at`.

```ts
composition.motion('slide-in', {
  at: 250
});
```

Current behavior:

```txt
item.at shifts the compiled item as a block.
```

Example:

```txt
internal step 1 at = 0
internal step 2 at = 300

item.at = 1000

compiled step 1 at = 1000
compiled step 2 at = 1300
```

With labels:

```txt
internal step 1 at = 0
internal step 2 at = 300

item.at = 'intro'

compiled step 1 at = { label: 'intro', offset: 0 }
compiled step 2 at = { label: 'intro', offset: 300 }
```

If an internal step has no `at`, it is placed directly at the item `at`.

## 14. Labels behavior

Composition-level labels are supported.

```ts
const composition = createMotionComposition((composition) => {
  composition.label('start', 0);

  composition.motion('fade-in', {
    at: 'start'
  });
});
```

Item-level labels are also supported.

```ts
const composition = createMotionComposition((composition) => {
  composition.motion('fade-in', {
    label: 'card-enter',
    at: 300
  });

  composition.motion('slide-in', {
    at: {
      label: 'card-enter',
      offset: 150
    }
  });
});
```

Compilation behavior:

```txt
composition.labels are copied first
item.label entries are added to the final timeline.labels
later items may reference labels created by earlier items
steps may reference labels through at
final timeline validation checks label references
```

Examples:

```txt
item.label = card-enter
item.at = 300
=> timeline.labels.card-enter = 300
```

```txt
composition.labels.intro = 500
item.label = card-enter
item.at = { label: 'intro', offset: 150 }
=> timeline.labels.card-enter = 650
```

### 14.1 Duplicate labels

An item label cannot duplicate a composition label or a previous item label.

```txt
composition.labels.intro exists
item.label = intro
=> composition-duplicate-label
```

### 14.2 Missing label references

An item label cannot be resolved from a missing label reference.

```txt
item.label = card-enter
item.at = missing-label
=> composition-item-label-reference-missing
```

### 14.3 Anchor placement limitation

Item labels do not currently support anchor-based placement.

```txt
item.label = card-enter
item.at = { anchor: 'track-start' }
=> composition-item-label-anchor-position-unsupported
```

This limitation is intentional because anchor positions are resolved during scheduling, while item labels must be materialized as numeric timeline labels during composition compilation.

## 15. Builder behavior

`MotionCompositionBuilder` is a convenience API.

It stores data and returns a plain `MotionCompositionDefinition`.

### 15.1 defaults()

```ts
composition.defaults({ duration: 300 });
composition.defaults({ easing: 'linear' });
```

The defaults are merged.

Later calls override matching keys from earlier calls.

### 15.2 label()

```ts
composition.label('start', 0);
```

Adds or overrides one composition-level label.

### 15.3 labels()

```ts
composition.labels({
  start: 0,
  visible: 300
});
```

Merges multiple composition-level labels.

Later values override matching label names.

### 15.4 motion()

```ts
composition.motion('fade-in', {
  label: 'card-enter',
  options: {},
  at: 0,
  defaults: {},
  target: { type: 'self' }
});
```

Adds a registered motion item.

The method returns the builder, so calls can be chained.

### 15.5 timeline()

```ts
composition.timeline(timeline, {
  label: 'timeline-enter',
  at: 100,
  target: { type: 'self' },
  defaults: { duration: 200 }
});
```

Adds a direct timeline item.

### 15.6 build()

```ts
const definition = builder.build();
```

Returns a plain `MotionCompositionDefinition`.

The returned object is not automatically compiled.

## 16. Validation behavior

`compileMotionComposition()` validates the final compiled timeline.

It throws `MotionPlanningError` when compilation cannot produce a valid timeline.

Current error codes:

```txt
composition-empty
composition-item-unknown-motion-type
composition-item-invalid-options
composition-invalid-timeline
composition-item-unsupported-kind
composition-duplicate-label
composition-item-label-reference-missing
composition-item-label-anchor-position-unsupported
```

### 16.1 Empty composition

```ts
compileMotionComposition({ items: [] }, { registry });
```

Throws:

```txt
composition-empty
```

### 16.2 Unknown motion type

```ts
compileMotionComposition(
  {
    items: [
      {
        kind: 'motion',
        type: 'unknown-motion'
      }
    ]
  },
  { registry }
);
```

Throws:

```txt
composition-item-unknown-motion-type
```

### 16.3 Invalid motion options

If the resolved `MotionDefinition` exposes `validateOptions()` and returns validation errors, the compiler throws:

```txt
composition-item-invalid-options
```

The option validation messages are stored on the `MotionPlanningError`.

### 16.4 Invalid compiled timeline

After all items are compiled and merged, the final timeline is validated.

If the final timeline is invalid, the compiler throws:

```txt
composition-invalid-timeline
```

Timeline validation diagnostics are stored on the `MotionPlanningError`.

### 16.5 Item label errors

Duplicate labels throw:

```txt
composition-duplicate-label
```

Missing label references throw:

```txt
composition-item-label-reference-missing
```

Anchor-based item label placement throws:

```txt
composition-item-label-anchor-position-unsupported
```

### 16.6 Runtime convenience failure result

`playComposition()` catches `MotionPlanningError` and returns a failed result instead of throwing.

Example:

```txt
status: failed
reason: composition-item-unknown-motion-type
```

`planComposition()` is a planning API. Like `planTimeline()`, it can throw planning errors.

## 17. Reduced motion behavior

The composition compiler does not currently compile per-item reduced motion timelines.

Current behavior:

```txt
composition compiles normal timeline only
motion.playComposition() delegates to playTimeline()
motion.playTimeline() handles reduced-motion runtime behavior through the existing timeline playback options
```

Because the compiler returns a direct timeline, it does not currently call `buildReducedMotionTimeline()` on each registered motion.

Future versions may add a composition-aware reduced motion path.

Possible future API:

```ts
compileMotionComposition(composition, {
  registry,
  reducedMotion: true
});
```

This is not available yet.

## 18. Runtime behavior

The runtime convenience methods are intentionally thin.

```ts
await motion.playComposition(element, composition);

const playback = motion.createCompositionPlayback(element, composition);

const plan = motion.planComposition(composition);
```

They are equivalent to:

```txt
compileMotionComposition()
  -> playTimeline() / createTimelinePlayback() / planTimeline()
```

They do not introduce a second runtime, a second driver contract, or a second scheduler.

The main benefit is ergonomics:

```txt
users can play a composition without manually importing compileMotionComposition
engine registry is reused automatically
existing timeline behavior remains the single runtime path
```

## 19. Serialization behavior

`MotionCompositionDefinition` is designed to be JSON-safe.

Allowed:

```txt
strings
numbers
booleans
plain objects
arrays
```

Not allowed in the canonical definition:

```txt
functions
DOM elements
Animation objects
class instances
Map
Set
Date
```

Builder callbacks are not serializable, but their output is.

Serialize the result of `createMotionComposition()`, not the callback itself.

## 20. Example with vanilla Web driver

```ts
import {
  createMotionComposition,
  createMotionEngine,
  DefaultMotionRegistry
} from '@structifyx/motion-core';
import { registerBasicMotions } from '@structifyx/motion-pack-basic';
import { WebMotionDriver } from '@structifyx/motion-web';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});

const composition = createMotionComposition((composition) => {
  composition.defaults({
    duration: 450,
    easing: 'ease-out',
    fill: 'both'
  });

  composition.motion('fade-in', {
    label: 'card-enter',
    options: {
      fromOpacity: 0,
      toOpacity: 1
    },
    defaults: {
      duration: 250
    }
  });

  composition.motion('slide-in', {
    at: {
      label: 'card-enter',
      offset: 250
    },
    options: {
      direction: 'bottom',
      distance: 32,
      fade: false
    },
    defaults: {
      duration: 450
    }
  });
});

await motion.playComposition(element, composition);
```

Manual compilation is still available:

```ts
const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

## 21. Current limitations

Current limitations are intentional.

```txt
No per-item reduced motion compilation.
No structured composition diagnostics.
No async motion loading.
No dependency resolution between composition items.
No nested composition groups.
No preset/variant system yet.
No anchor-based item label materialization.
```

These limitations keep the first public composition API small and predictable.

## 22. Recommended usage today

Use composition when you need to coordinate multiple motions or timelines.

Recommended:

```txt
create MotionCompositionDefinition
use createMotionComposition() for authoring DX
use item.label for synchronizing later items to earlier composition items
use motion.playComposition() for direct playback
use compileMotionComposition() when the compiled timeline must be inspected or cached
store MotionCompositionDefinition when authoring in a builder
store MotionTimelineDefinition when caching compiled output
```

Avoid:

```txt
putting DOM elements in the composition object
using anchor-based positions for item labels
expecting per-item reduced motion timelines to be generated
using composition as a second runtime model
```

## 23. Implementation status

Implemented:

```txt
MotionCompositionDefinition
RegisteredMotionCompositionItem
TimelineCompositionItem
CompileMotionCompositionContext
compileMotionComposition()
MotionCompositionBuilder
createMotionComposition()
motion.planComposition()
motion.playComposition()
motion.createCompositionPlayback()
composition block offset placement
composition item labels
vanilla composition demo
```

Not implemented yet:

```txt
composition-specific reduced motion
composition diagnostics object model
nested composition groups
preset/variant system
anchor-based item label materialization
```
