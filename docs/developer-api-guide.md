# Structifyx Motion Engine - Developer API Guide

> Status: developer-facing reference draft.
> Purpose: this document is the foundation for the future complete documentation website/tooling.
> Scope: current public API, architecture audit, usage rules, examples and documentation roadmap.

## 1. Executive summary

Structifyx Motion Engine is a framework-agnostic TypeScript motion engine.

Its goal is to let developers define, validate, plan and play animations without coupling the core package to a specific UI framework or runtime platform.

The current API now supports two official usage modes:

```txt
1. Registered motion definitions
2. Direct timeline playback
```

The engine can now be created through a public facade:

```ts
const motion = createMotionEngine({
  driver
});
```

It can receive global defaults and global validation options:

```ts
const motion = createMotionEngine({
  driver,
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  },
  validation: {
    performanceDiagnostics: {
      filter: 'warning',
      shadow: 'warning',
      paint: 'info'
    }
  }
});
```

It can register reusable motion definitions:

```ts
motion.register(new FadeInMotion()).register(new FadeOutMotion());
```

It can also play a timeline directly:

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(element, timeline);
```

The most important architectural rule remains:

```txt
motion-core defines, validates, plans and schedules motion.
drivers execute motion on a concrete platform.
```

The core must stay independent from:

```txt
- DOM
- Web Animations API
- CSSStyleDeclaration
- Angular
- React
- GSAP
- browser-only APIs
```

## 2. Current API audit

### 2.1 What has been implemented

The current API contains the following major pieces:

```txt
- createMotionEngine() factory
- MotionEngine public interface
- engine-level registry helpers
- engine-level defaults
- engine-level validation options
- direct timeline playback
- direct timeline planning
- timeline playback controllers
- timeline builder API
- reusable MotionDefinition classes
- validation pipeline
- planning pipeline
- scheduling pipeline
- Web driver package
- basic motion pack package
```

### 2.2 Current maturity level

The engine has moved from an internal architecture prototype to a usable developer API foundation.

The API is not yet a complete public SDK, but the main usage model is now stable enough to document.

Current maturity:

```txt
Architecture foundation: strong
Core / driver separation: strong
Direct API usability: good
Registry workflow: good
Global config: first version ready
Documentation: this file starts the official developer documentation base
Event system: not yet implemented
Plugin/preset documentation: partial
Integration guides: not yet implemented
Versioning policy: not yet implemented
```

### 2.3 Important architectural wins

The following decisions are already good and should be preserved:

```txt
- MotionTimelineDefinition remains the official serializable model.
- createMotionTimeline() is only a builder convenience.
- createMotionEngine() is the official public factory.
- DefaultMotionEngine stays an implementation detail for most users.
- MotionDefinition is the reusable/preset animation abstraction.
- The engine can play registered motions and raw timelines.
- Defaults and validation are configurable at engine level.
- Per-play validation can override engine validation.
- Drivers execute timelines; the core does not touch the platform.
```

### 2.4 Main risks to monitor

The API is already clean, but the following risks should be watched carefully:

```txt
- Adding too many platform-specific concepts inside motion-core.
- Making the builder more important than MotionTimelineDefinition.
- Creating several competing timeline creation APIs.
- Adding global config fields before their behavior is fully defined.
- Letting examples drift from the real implemented API.
- Mixing direct playback API and future scene/sequence API too early.
- Treating documentation as marketing instead of technical contract.
```

## 3. Mental model

The engine works as a pipeline.

```txt
Motion input
  -> normalization
  -> validation
  -> defaults resolution
  -> timeline preparation
  -> execution planning
  -> scheduling
  -> driver execution
```

There are two main input types:

```txt
MotionConfig
  -> references a registered MotionDefinition by type

MotionTimelineDefinition
  -> explicit timeline object, created manually or with createMotionTimeline()
```

### 3.1 Registered motion flow

```txt
MotionConfig
  -> registry.get(type)
  -> definition.normalizeOptions()
  -> definition.buildTimeline()
  -> engine defaults
  -> validation
  -> execution plan
  -> driver.play()
```

Example:

```ts
motion.register(new SlideInMotion());

await motion.play(element, {
  id: 'hero-slide-in',
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 48,
    fade: true
  }
});
```

### 3.2 Direct timeline flow

```txt
createMotionTimeline()
  -> MotionTimelineDefinition
  -> engine defaults
  -> validation
  -> execution plan
  -> driver.play()
```

Example:

```ts
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

## 4. Package responsibilities

### 4.1 motion-core

`@structifyx/motion-core` is responsible for the platform-independent API and pipeline.

It owns:

```txt
- createMotionEngine()
- MotionEngine interface
- MotionDefinition contract
- MotionTimelineDefinition model
- createMotionTimeline() builder
- timeline validation
- defaults resolution
- execution planning
- scheduling
- playback controller contracts
- diagnostics models
- test/noop drivers
```

It must not own:

```txt
- DOM element resolution
- WAAPI calls
- CSSStyleDeclaration logic
- Angular directives
- React hooks
- GSAP adapters
- browser-only assumptions
```

### 4.2 motion-web

`@structifyx/motion-web` is responsible for Web platform execution.

It can know about:

```txt
- Element
- Web Animations API
- keyframe conversion for browsers
- target resolution in the DOM
- reduced motion behavior on the Web
- conflict resolution for active web animations
```

### 4.3 motion-pack-basic

`@structifyx/motion-pack-basic` contains reusable motion definitions.

Examples:

```txt
- fade-in
- fade-out
- slide-in
```

This package is important because it proves the registry/preset workflow.

## 5. Public API overview

### 5.1 Engine creation

```ts
import { createMotionEngine } from '@structifyx/motion-core';

const motion = createMotionEngine({
  driver
});
```

`createMotionEngine()` is the recommended entry point.

Most application developers should not instantiate `DefaultMotionEngine` manually.

### 5.2 Engine config

```ts
type MotionEngineConfig<TTarget = unknown> = {
  readonly driver: MotionDriver<TTarget>;
  readonly registry?: MotionRegistry;
  readonly normalizer?: MotionConfigNormalizer;
  readonly defaults?: MotionTimelineDefaults;
  readonly validation?: MotionValidationOptions;
};
```

Field meaning:

```txt
driver
  Required. Executes the generated plan on a platform.

registry
  Optional. Stores MotionDefinition instances.
  If omitted, the engine creates a default registry.

normalizer
  Optional. Normalizes MotionConfig values.
  If omitted, the engine uses the default normalizer.

defaults
  Optional. Global timeline defaults applied by the engine.

validation
  Optional. Global validation options used by the engine.
```

### 5.3 Engine interface

Current engine capabilities:

```ts
interface MotionEngine<TTarget = unknown> {
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): MotionEngine<TTarget>;
  registerMany(definitions: ReadonlyArray<MotionDefinition<object>>): MotionEngine<TTarget>;

  has(type: string): boolean;
  get(type: string): MotionDefinition<object> | undefined;
  getAll(): ReadonlyArray<MotionDefinition<object>>;
  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>;

  play(target: TTarget, config: MotionConfig): Promise<MotionPlaybackResult>;
  playTimeline(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): Promise<MotionPlaybackResult>;

  cancel(target: TTarget): Promise<MotionPlaybackResult>;
  finish(target: TTarget): Promise<MotionPlaybackResult>;
  reset(target: TTarget): Promise<MotionPlaybackResult>;

  createPlayback(target: TTarget, config: MotionConfig): MotionPlaybackController;
  createTimelinePlayback(
    target: TTarget,
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionPlaybackController;

  plan(config: MotionConfig): MotionExecutionPlan;
  planTimeline(
    timeline: MotionTimelineDefinition,
    options?: MotionTimelinePlayOptions
  ): MotionExecutionPlan;
}
```

## 6. Engine defaults

Engine defaults define application-level animation behavior.

Example:

```ts
const motion = createMotionEngine({
  driver,
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  }
});
```

Engine defaults are useful when an application wants consistent animation behavior without repeating the same values in every timeline.

### 6.1 Defaults priority

Timing and timeline defaults follow this priority:

```txt
step value
  > track defaults
  > timeline defaults
  > engine defaults
  > core defaults
```

This means the more local value always wins.

Example:

```ts
const motion = createMotionEngine({
  driver,
  defaults: {
    duration: 500,
    easing: 'ease-out',
    fill: 'both'
  }
});

const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({
    duration: 300
  });

  timeline.track('self', (track) => {
    track.step({ duration: 100 }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

Resolved result:

```txt
duration = 100
  from step value

easing = ease-out
  from engine defaults

fill = both
  from engine defaults
```

### 6.2 Recommended usage

Use engine defaults for application-wide policy:

```txt
- default duration
- default easing
- default fill mode
- default iteration behavior if needed
```

Do not use engine defaults for animation-specific intent.

Good:

```ts
const motion = createMotionEngine({
  driver,
  defaults: {
    duration: 250,
    easing: 'ease-out'
  }
});
```

Avoid:

```ts
const motion = createMotionEngine({
  driver,
  defaults: {
    duration: 1200 // too specific for every animation
  }
});
```

## 7. Validation options

Engine validation defines application-level validation behavior.

Example:

```ts
const motion = createMotionEngine({
  driver,
  validation: {
    performanceDiagnostics: {
      filter: 'warning',
      shadow: 'warning',
      paint: 'info'
    }
  }
});
```

### 7.1 Validation priority

Validation follows this priority:

```txt
play options validation
  > engine validation
  > core validation defaults
```

Example:

```ts
await motion.playTimeline(element, timeline, {
  validation: {
    performanceDiagnostics: {
      filter: 'error'
    }
  }
});
```

In this case, the play call can be stricter than the engine default for this specific timeline.

### 7.2 Recommended usage

Use engine validation to set global safety rules.

Use per-play validation when a specific use case needs a different level.

Examples:

```txt
Development mode
  warnings or errors for expensive animation properties

Production mode
  stricter validation for critical UI animations

Tests
  strict validation to catch invalid timelines early
```

## 8. Registered motion definitions

A registered motion is a reusable animation definition.

It is identified by a `type`.

Example:

```ts
motion.register(new FadeInMotion());

await motion.play(element, {
  id: 'intro-fade',
  type: 'fade-in'
});
```

### 8.1 When to use registered motions

Use registered motions for:

```txt
- reusable animations
- shared animation packs
- design-system presets
- builder-selectable animations
- configuration-driven UI
- marketplace-ready motion presets
```

### 8.2 Registering one motion

```ts
motion.register(new FadeInMotion());
```

`register()` returns the engine instance, so it can be chained.

```ts
motion.register(new FadeInMotion()).register(new FadeOutMotion());
```

### 8.3 Registering many motions

```ts
motion.registerMany([new FadeInMotion(), new FadeOutMotion(), new SlideInMotion()]);
```

### 8.4 Registry helper methods

```ts
motion.has('fade-in');

const fadeIn = motion.get('fade-in');

const allMotions = motion.getAll();

const entranceMotions = motion.getByCategory('entrance');
```

These methods are useful for:

```txt
- visual builders
- animation inspectors
- admin UIs
- debug panels
- auto-generated documentation
- preset galleries
```

## 9. Direct timeline playback

Direct timeline playback lets developers create and play a timeline without defining a reusable class.

Example:

```ts
import { createMotionEngine, createMotionTimeline } from '@structifyx/motion-core';

const motion = createMotionEngine({
  driver
});

const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step({ duration: 300, easing: 'ease-out' }, (step) => {
      step.from({
        opacity: 0,
        transform: {
          y: 24
        }
      });

      step.to({
        opacity: 1,
        transform: {
          y: 0
        }
      });
    });
  });
});

await motion.playTimeline(element, timeline);
```

### 9.1 When to use direct timelines

Use direct timelines for:

```txt
- one-off animations
- dynamic animations
- tests
- generated animation output
- visual builder runtime output
- AI-generated timeline output
- prototyping
```

Do not use direct timelines when the animation should become a reusable product/preset. In that case, prefer `MotionDefinition`.

## 10. Timeline builder

The builder is a convenience API that creates a `MotionTimelineDefinition`.

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.defaults({
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  });

  timeline.label('intro', 0);

  timeline.track('self', (track) => {
    track.step({ at: 'intro' }, (step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

The builder supports:

```txt
- timeline defaults
- labels
- multiple tracks
- track defaults
- stagger
- multiple steps
- free keyframes
- from/to helpers
- final build output
```

### 10.1 Timeline builder methods

```ts
timeline.defaults(defaults);
timeline.label(name, position);
timeline.track(target, callback);
timeline.build();
```

### 10.2 Track builder methods

```ts
track.defaults(defaults);
track.stagger(stagger);
track.step(callback);
track.step(options, callback);
track.build();
```

### 10.3 Step builder methods

```ts
step.keyframe(keyframe);
step.keyframes(keyframes);
step.from(keyframe);
step.to(keyframe);
step.build();
```

`from()` automatically adds `offset: 0`.

`to()` automatically adds `offset: 1`.

### 10.4 Builder rule

The builder must never reduce the capability of `MotionTimelineDefinition`.

The official source-of-truth model remains:

```txt
MotionTimelineDefinition
```

The builder is only a readable way to produce this model.

## 11. MotionTimelineDefinition

`MotionTimelineDefinition` is the official serializable timeline model.

It is important because it can be:

```txt
- stored in a database
- generated by a visual builder
- generated by AI
- validated before playback
- converted to execution plans
- reused across drivers
- inspected by developer tools
```

Typical shape:

```ts
const timeline: MotionTimelineDefinition = {
  defaults: {
    duration: 300,
    easing: 'ease-out'
  },
  labels: {
    intro: 0
  },
  tracks: [
    {
      target: {
        type: 'self'
      },
      steps: [
        {
          at: 'intro',
          keyframes: [
            {
              offset: 0,
              opacity: 0
            },
            {
              offset: 1,
              opacity: 1
            }
          ]
        }
      ]
    }
  ]
};
```

## 12. Targets

A target describes what the timeline track should animate.

The simplest target is:

```ts
timeline.track('self', (track) => {
  // ...
});
```

This becomes:

```ts
{
  type: 'self';
}
```

Structured target references can also be used:

```ts
timeline.track({ type: 'child', name: 'title' }, (track) => {
  // ...
});
```

Known target concepts:

```txt
self
child
selector
named
```

The core does not resolve real elements.

Target resolution belongs to the driver.

## 13. Playback controllers

For immediate playback, use:

```ts
await motion.play(element, config);
await motion.playTimeline(element, timeline);
```

For manual control, create a playback controller:

```ts
const controller = motion.createTimelinePlayback(element, timeline);

controller.play();
controller.pause();
controller.resume();
controller.cancel();
```

Registered motions can also create controllers:

```ts
const controller = motion.createPlayback(element, {
  id: 'intro',
  type: 'fade-in'
});

controller.play();
```

Playback controllers are useful for:

```txt
- user-controlled animations
- pause/resume UIs
- interactive flows
- route transitions
- tests
- advanced runtime orchestration
```

## 14. Planning without playing

The engine can plan animations without executing them.

Registered motion:

```ts
const plan = motion.plan({
  id: 'intro',
  type: 'fade-in'
});
```

Direct timeline:

```ts
const plan = motion.planTimeline(timeline);
```

Planning is useful for:

```txt
- validation
- tests
- debug tools
- developer inspectors
- visual builder previews
- performance analysis
- generated documentation
```

## 15. MotionDefinition authoring

A `MotionDefinition` represents a reusable animation.

A motion definition should:

```txt
- expose a stable type
- expose metadata
- define default options
- normalize user options
- validate options if needed
- build a MotionTimelineDefinition
```

Simplified example:

```ts
class FadeInMotion extends BaseMotionDefinition<FadeInOptions> {
  readonly type = 'fade-in';
  readonly label = 'Fade in';
  readonly description = 'Fades an element in.';
  readonly category = 'entrance';
  readonly optionDefinitions = [];

  getDefaultOptions(): FadeInOptions {
    return {
      from: 0,
      to: 1
    };
  }

  normalizeOptions(options: Record<string, unknown> | undefined): FadeInOptions {
    return {
      from: typeof options?.from === 'number' ? options.from : 0,
      to: typeof options?.to === 'number' ? options.to : 1
    };
  }

  buildTimeline(context: MotionBuildContext<FadeInOptions>): MotionTimelineDefinition {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: context.duration,
            easing: context.easing
          },
          (step) => {
            step.from({ opacity: context.options.from });
            step.to({ opacity: context.options.to });
          }
        );
      });
    });
  }
}
```

Recommended rule:

```txt
Use MotionDefinition for anything reusable.
Use direct timelines for one-off/generated timelines.
```

## 16. Diagnostics and validation philosophy

Validation exists to protect developers from invalid timelines and risky animation choices.

Diagnostics should be:

```txt
- stable
- predictable
- useful
- documented
- non-surprising
```

Do not casually change diagnostic codes or severity behavior.

Diagnostics should support future tooling:

```txt
- IDE hints
- visual builder warnings
- CI checks
- documentation generation
- accessibility/performance review
```

## 17. Performance philosophy

The engine should encourage performant animation patterns.

Generally safe animation properties:

```txt
- opacity
- transform
```

Potentially expensive properties:

```txt
- filter
- box-shadow
- paint-heavy properties
- layout-triggering properties
```

The exact validation behavior should remain configurable through `MotionValidationOptions`.

## 18. Reduced motion

Reduced motion exists as an accessibility and user-preference concern.

The engine already supports the concept of reduced motion timelines in the planning flow.

Documentation rule:

```txt
Reduced motion behavior must be explicit and testable.
```

Future docs should include:

```txt
- how to define reduced motion timelines
- driver behavior for reduced motion
- application-level reduced motion strategy
- accessibility recommendations
```

## 19. Stability rules

The following rules are part of the current API contract:

```txt
- createMotionEngine() is the official engine factory.
- MotionEngine is the official public engine interface.
- DefaultMotionEngine is an implementation detail for most users.
- createMotionTimeline() is the official timeline builder helper.
- MotionTimelineDefinition remains the official serializable model.
- The core must stay framework-agnostic.
- Drivers execute platform-specific behavior.
- Engine defaults must not override timeline, track or step values.
- Per-play validation must override engine validation.
- playbackRate must not change activeDuration.
- Optional properties must not be set explicitly to undefined.
```

## 20. Recommended developer workflows

### 20.1 Application startup

```ts
const motion = createMotionEngine({
  driver: new WebMotionDriver(),
  defaults: {
    duration: 300,
    easing: 'ease-out',
    fill: 'both'
  },
  validation: {
    performanceDiagnostics: {
      filter: 'warning',
      shadow: 'warning',
      paint: 'info'
    }
  }
});

motion.registerMany([new FadeInMotion(), new FadeOutMotion(), new SlideInMotion()]);
```

### 20.2 Play a preset animation

```ts
await motion.play(element, {
  id: 'hero-intro',
  type: 'slide-in',
  options: {
    direction: 'bottom',
    distance: 48,
    fade: true
  }
});
```

### 20.3 Play a direct animation

```ts
const timeline = createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});

await motion.playTimeline(element, timeline);
```

### 20.4 Inspect registered animations

```ts
const all = motion.getAll();
const entrance = motion.getByCategory('entrance');
const hasFadeIn = motion.has('fade-in');
```

### 20.5 Plan before playing

```ts
const plan = motion.planTimeline(timeline);
```

This is useful before sending a timeline to a driver or visual debug tool.

## 21. Anti-patterns

### 21.1 Do not couple core to DOM

Avoid adding this kind of logic to `motion-core`:

```ts
document.querySelector(...)
element.animate(...)
getComputedStyle(...)
```

This belongs to a driver or adapter package.

### 21.2 Do not replace MotionTimelineDefinition with the builder

Bad direction:

```txt
Builder becomes the only model.
```

Correct direction:

```txt
Builder produces MotionTimelineDefinition.
MotionTimelineDefinition remains the source of truth.
```

### 21.3 Do not create duplicate public APIs too early

Avoid adding several names for the same operation.

For now, the official timeline builder helper is:

```ts
createMotionTimeline(callback);
```

Do not document `motion.createTimeline()` unless that method is actually implemented.

### 21.4 Do not use engine defaults for every animation detail

Engine defaults are application policy, not animation identity.

Specific animation behavior belongs in:

```txt
- step values
- track defaults
- timeline defaults
- MotionDefinition options
```

## 22. Documentation roadmap

This file is the base for the future complete documentation.

Recommended future documentation structure:

```txt
docs/
  introduction.md
  getting-started.md
  installation.md
  concepts/
    engine.md
    timelines.md
    tracks.md
    steps.md
    keyframes.md
    targets.md
    drivers.md
    registry.md
    validation.md
    diagnostics.md
    reduced-motion.md
  api/
    create-motion-engine.md
    motion-engine.md
    create-motion-timeline.md
    motion-definition.md
    motion-driver.md
    timeline-model.md
  guides/
    direct-timeline-playback.md
    registered-motions.md
    writing-a-motion-definition.md
    creating-a-motion-pack.md
    web-driver.md
    testing-motions.md
    performance.md
    accessibility.md
  examples/
    fade-in.md
    slide-in.md
    staggered-list.md
    reduced-motion.md
    custom-driver.md
```

## 23. Documentation generator requirements

A future documentation tool should be able to extract:

```txt
- exported API types
- examples
- method signatures
- option tables
- diagnostic codes
- motion pack metadata
- category lists
- default values
- stability notes
```

This means public APIs should keep:

```txt
- clear type names
- stable exports
- explicit models
- documented priority rules
- examples close to real tests
```

## 24. Recommended next technical steps

After this documentation step, the next product-level steps should probably be:

```txt
1. Refactor motion-pack-basic to use createMotionTimeline() internally.
2. Add global playback event listeners.
3. Add a documented web driver quickstart.
4. Add examples that import motion-core + motion-web together.
5. Add documentation for writing a custom MotionDefinition.
6. Add documentation for writing a custom driver.
```

## 25. Final API position

The current developer API is now centered around three public concepts:

```txt
createMotionEngine()
  -> creates the engine and owns global policy

createMotionTimeline()
  -> creates serializable timelines comfortably

MotionDefinition
  -> creates reusable registered motions
```

This is a good foundation for a professional animation system.

The next phase should focus on making this API pleasant, documented, tested through examples and stable enough to support framework adapters, visual builders and generated documentation.
