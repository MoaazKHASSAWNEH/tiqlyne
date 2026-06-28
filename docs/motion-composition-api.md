# Motion Composition API

> Status: current public API guide.
> Scope: `@structifyx/motion-core` composition API.
> Audience: users creating composed animations from registered motions and direct timelines.
> Runtime support: composition is compiled first, then played with the existing timeline pipeline.

## 1. Purpose

The composition API lets users describe a coordinated animation made from multiple items:

```txt
registered motions
existing direct timelines
multiple targets
timing overrides
labels
placement values
```

The composition API does not execute animations directly.

It produces a canonical `MotionCompositionDefinition`, then compiles it into a `MotionTimelineDefinition`.

```txt
createMotionComposition()
  -> MotionCompositionDefinition
  -> compileMotionComposition()
  -> MotionTimelineDefinition
  -> motion.playTimeline()
```

This keeps the engine architecture simple:

```txt
composition = authoring layer
MotionTimelineDefinition = serializable runtime timeline
MotionEngine = existing playback runtime
MotionDriver = platform execution
```

## 2. Main APIs

```ts
createMotionComposition(callback): MotionCompositionDefinition
compileMotionComposition(composition, context): MotionTimelineDefinition
new MotionCompositionBuilder().build(): MotionCompositionDefinition
```

The builder API is optional. The object model remains the canonical representation.

## 3. Canonical object model

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
      at: 'start',
      options: {
        fromOpacity: 0,
        toOpacity: 1
      }
    },
    {
      kind: 'motion',
      type: 'slide-in',
      at: 250,
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

## 4. Builder usage

```ts
const composition = createMotionComposition((composition) => {
  composition.defaults({
    duration: 450,
    easing: 'ease-out',
    fill: 'both'
  });

  composition.label('start', 0);

  composition.motion('fade-in', {
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
    at: 250,
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
MotionCompositionDefinition
```

The builder does not compile or play the animation.

## 5. Compilation usage

Registered motion items require a registry.

```ts
const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);

const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

`compileMotionComposition()` returns a `MotionTimelineDefinition` that can be passed to the existing APIs:

```ts
motion.playTimeline(target, timeline);
motion.createTimelinePlayback(target, timeline);
motion.planTimeline(timeline);
```

## 6. Registered motion items

A registered motion item references a `MotionDefinition` by type.

```ts
composition.motion('fade-in', {
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
8. Validate the final compiled timeline.
```

If the motion type is missing from the registry, compilation throws a `MotionPlanningError` with code:

```txt
composition-item-unknown-motion-type
```

If options are invalid, compilation throws a `MotionPlanningError` with code:

```txt
composition-item-invalid-options
```

## 7. Direct timeline items

A direct timeline item embeds an existing `MotionTimelineDefinition`.

```ts
composition.timeline(existingTimeline, {
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
4. Apply optional placement to the first step of each track.
5. Merge tracks into the final timeline.
6. Validate the final compiled timeline.
```

Direct timeline items do not require registry lookup.

## 8. Defaults behavior

There are three default layers.

```txt
context.defaults
composition.defaults
item.defaults
```

### 8.1 context.defaults

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

### 8.2 composition.defaults

`composition.defaults` is the default timing layer for the composition.

```ts
composition.defaults({
  duration: 450,
  easing: 'ease-out',
  fill: 'both'
});
```

It is copied to the final compiled timeline defaults, merged over `context.defaults`.

### 8.3 item.defaults

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

### 8.4 Merge order

The effective build context for a registered motion item is resolved in this order:

```txt
item.defaults
composition.defaults
context.defaults
internal fallback
```

More specific values win.

Example:

```ts
compileMotionComposition(
  createMotionComposition((composition) => {
    composition.defaults({
      duration: 500,
      easing: 'linear'
    });

    composition.motion('fade-in', {
      defaults: {
        duration: 200
      }
    });
  }),
  {
    registry,
    defaults: {
      duration: 700,
      delay: 50,
      easing: 'ease-out'
    }
  }
);
```

Effective values for the item build context:

```txt
duration = 200 from item.defaults
delay = 50 from context.defaults
easing = linear from composition.defaults
```

The final timeline defaults contain the merged timeline-level defaults:

```txt
context.defaults + composition.defaults
```

Item defaults do not become global timeline defaults.

## 9. Explicit values are preserved

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

## 10. Target behavior

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
{ type: 'self' }
```

`self` means the runtime target passed to `motion.playTimeline()`.

```ts
await motion.playTimeline(element, timeline);
```

So a track with `{ type: 'self' }` resolves to `element` in the Web driver.

## 11. Placement behavior with `at`

Each item may provide `at`.

```ts
composition.motion('slide-in', {
  at: 250
});
```

Current phase behavior:

```txt
item.at is applied to the first step of every compiled track for that item.
```

This is intentionally simple.

Example:

```txt
item.at = 250
compiled track A first step at = 250
compiled track B first step at = 250
```

Steps after the first step are not shifted as a block yet.

This means the current composition compiler does not yet implement advanced block offset behavior.

Future behavior may support:

```txt
item.at shifts the whole compiled item as a block
```

For now, use simple numeric positions or labels for predictable behavior.

## 12. Labels behavior

Composition-level labels are supported.

```ts
const composition = createMotionComposition((composition) => {
  composition.label('start', 0);

  composition.motion('fade-in', {
    at: 'start'
  });
});
```

Equivalent object form:

```ts
{
  labels: {
    start: 0
  },
  items: [
    {
      kind: 'motion',
      type: 'fade-in',
      at: 'start'
    }
  ]
}
```

Compilation behavior:

```txt
composition.labels are copied to the final timeline.labels.
steps may reference those labels through at
final timeline validation checks label references
```

Current limitation:

```txt
item.label is not part of the current implementation.
```

Use `composition.label(name, position)` or `composition.labels({...})` instead.

## 13. Builder behavior

`MotionCompositionBuilder` is a convenience API.

It stores data and returns a plain `MotionCompositionDefinition`.

### 13.1 defaults()

```ts
composition.defaults({ duration: 300 });
composition.defaults({ easing: 'linear' });
```

The defaults are merged.

Result:

```ts
{
  defaults: {
    duration: 300,
    easing: 'linear'
  },
  items: []
}
```

Later calls override matching keys from earlier calls.

### 13.2 label()

```ts
composition.label('start', 0);
```

Adds or overrides one label.

### 13.3 labels()

```ts
composition.labels({
  start: 0,
  visible: 300
});
```

Merges multiple labels.

Later values override matching label names.

### 13.4 motion()

```ts
composition.motion('fade-in', {
  options: {},
  at: 0,
  defaults: {},
  target: { type: 'self' }
});
```

Adds a registered motion item.

The method returns the builder, so calls can be chained.

### 13.5 timeline()

```ts
composition.timeline(timeline, {
  at: 100,
  target: { type: 'self' },
  defaults: { duration: 200 }
});
```

Adds a direct timeline item.

### 13.6 build()

```ts
const definition = builder.build();
```

Returns a plain `MotionCompositionDefinition`.

The returned object is not automatically compiled.

## 14. Validation behavior

`compileMotionComposition()` validates the final compiled timeline.

It throws `MotionPlanningError` when compilation cannot produce a valid timeline.

Current error codes:

```txt
composition-empty
composition-item-unknown-motion-type
composition-item-invalid-options
composition-invalid-timeline
composition-item-unsupported-kind
```

### 14.1 Empty composition

```ts
compileMotionComposition({ items: [] }, { registry });
```

Throws:

```txt
composition-empty
```

### 14.2 Unknown motion type

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

### 14.3 Invalid motion options

If the resolved `MotionDefinition` exposes `validateOptions()` and returns validation errors, the compiler throws:

```txt
composition-item-invalid-options
```

The option validation messages are stored on the `MotionPlanningError`.

### 14.4 Invalid compiled timeline

After all items are compiled and merged, the final timeline is validated.

If the final timeline is invalid, the compiler throws:

```txt
composition-invalid-timeline
```

Timeline validation diagnostics are stored on the `MotionPlanningError`.

## 15. Reduced motion behavior

The composition compiler does not currently compile reduced motion timelines.

Current behavior:

```txt
composition compiles normal timeline only
motion.playTimeline() handles reduced-motion behavior using the existing timeline playback options
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

## 16. Runtime behavior

There is no `motion.playComposition()` yet.

Use the explicit flow:

```ts
const composition = createMotionComposition((composition) => {
  composition.motion('fade-in');
});

const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

This is intentional.

Benefits:

```txt
composition remains independent from runtime
compiler remains easy to test
MotionEngine does not gain new behavior too early
existing timeline playback remains the single runtime path
```

Future convenience methods may be added later:

```ts
motion.playComposition(target, composition, options);
motion.createCompositionPlayback(target, composition, options);
motion.planComposition(composition, options);
```

## 17. Serialization behavior

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

## 18. Example with vanilla Web driver

```ts
import {
  compileMotionComposition,
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
    options: {
      fromOpacity: 0,
      toOpacity: 1
    },
    defaults: {
      duration: 250
    }
  });

  composition.motion('slide-in', {
    at: 250,
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

const timeline = compileMotionComposition(composition, {
  registry
});

await motion.playTimeline(element, timeline);
```

## 19. Current limitations

Current limitations are intentional.

```txt
No motion.playComposition() shortcut.
No createCompositionPlayback() shortcut.
No item.label support.
No advanced block offset algorithm.
No per-item reduced motion compilation.
No structured composition diagnostics.
No async motion loading.
No dependency resolution between composition items.
No preset/variant system yet.
```

These limitations keep the first public composition API small and predictable.

## 20. Recommended usage today

Use composition when you need to coordinate multiple motions or timelines.

Recommended:

```txt
create MotionCompositionDefinition
compile to MotionTimelineDefinition
play through motion.playTimeline()
store MotionCompositionDefinition when authoring in a builder
store MotionTimelineDefinition when caching compiled output
```

Avoid:

```txt
using composition as a runtime shortcut
putting DOM elements in the composition object
using complex anchor placement before block offsets exist
expecting reduced motion timelines to be generated per item
```

## 21. Implementation status

Implemented:

```txt
MotionCompositionDefinition
RegisteredMotionCompositionItem
TimelineCompositionItem
CompileMotionCompositionContext
compileMotionComposition()
MotionCompositionBuilder
createMotionComposition()
vanilla composition demo
```

Not implemented yet:

```txt
motion.playComposition()
composition playback controller helpers
advanced block offset
item.label
composition-specific reduced motion
composition diagnostics object model
```
