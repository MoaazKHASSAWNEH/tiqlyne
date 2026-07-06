# Writing a Custom Motion Definition

> Status: developer guide.
> Purpose: explain how to create reusable custom motions with the current `@tiqlyne/motion-core` API.
> Scope: `MotionDefinition`, `SchemaMotionDefinition`, option schemas, option validators, timelines, tests and registration.
> Last verified state: after `7f9e6df feat(core): add numeric option validators`.

## 1. Goal

A custom motion is a reusable animation definition registered under a stable `type`.

It lets application code play an animation by name:

```ts
await motion.play(element, {
  type: 'scale-in',
  options: {
    fromScale: 0.9,
    toScale: 1,
    fade: true
  }
});
```

The custom motion owns:

```txt
metadata
  type, label, description, category

options
  public editable configuration for the motion

normalization
  conversion from raw user input to safe typed values

validation
  semantic rules that must be true after normalization

timeline building
  conversion from typed options to a serializable MotionTimelineDefinition
```

The recommended API for most custom motions is:

```txt
SchemaMotionDefinition
  Base class that removes repetitive optionDefinitions/getDefaultOptions/normalizeOptions code.

defineMotionOptions()
  Single source of truth for option metadata, defaults and normalization.

option.*
  Typed option builders.

optionValidators
  Reusable semantic validators.

createMotionTimeline()
  Low-level timeline builder kept fully explicit and powerful.
```

## 2. Recommended level: SchemaMotionDefinition

Use `SchemaMotionDefinition` for most reusable motions.

It is the best default because it keeps the class model while removing repetitive boilerplate.

```txt
Recommended for:
- application-specific reusable motions
- plugin/package motions
- builder-friendly motions
- motions with editable options
- motions that need semantic validation
```

Avoid starting with manual `MotionDefinition` unless the motion needs complete low-level control.

## 3. Full example: ScaleInMotion

This example creates a motion called `scale-in`.

It animates an element from a smaller scale to a larger scale, optionally animating opacity too.

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  validateIncreasing,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionKeyframe,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

const scaleInMotionOptions = defineMotionOptions({
  fromScale: option.range({
    label: 'From scale',
    description: 'Initial scale value.',
    defaultValue: 0.9,
    min: 0,
    max: 2,
    step: 0.05,
    unit: 'none'
  }),
  toScale: option.range({
    label: 'To scale',
    description: 'Final scale value.',
    defaultValue: 1,
    min: 0,
    max: 2,
    step: 0.05,
    unit: 'none'
  }),
  fade: option.boolean({
    label: 'Fade',
    description: 'Whether opacity should be animated too.',
    defaultValue: true
  })
});

export type ScaleInMotionOptions = InferMotionOptions<typeof scaleInMotionOptions.schema>;

export class ScaleInMotion extends SchemaMotionDefinition<typeof scaleInMotionOptions.schema> {
  readonly type = 'scale-in';
  readonly label = 'Scale in';
  readonly description = 'Makes the target appear with a scale animation.';
  readonly category: MotionCategory = 'entrance';

  protected readonly options = scaleInMotionOptions;

  protected override readonly optionValidators = [
    validateIncreasing('fromScale', 'toScale', 'Scale in value must increase')
  ];

  buildTimeline(context: MotionBuildContext<ScaleInMotionOptions>): MotionTimelineDefinition {
    const initialKeyframe: MotionKeyframe = context.options.fade
      ? {
          transform: `scale(${context.options.fromScale})`,
          opacity: 0
        }
      : {
          transform: `scale(${context.options.fromScale})`
        };

    const finalKeyframe: MotionKeyframe = context.options.fade
      ? {
          transform: `scale(${context.options.toScale})`,
          opacity: 1
        }
      : {
          transform: `scale(${context.options.toScale})`
        };

    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: context.duration,
            delay: context.delay,
            easing: context.easing,
            fill: 'both'
          },
          (step) => {
            step.from(initialKeyframe);
            step.to(finalKeyframe);
          }
        );
      });
    });
  }
}
```

## 4. Anatomy of the class

### 4.1 Metadata

Every motion must expose stable metadata.

```ts
readonly type = 'scale-in';
readonly label = 'Scale in';
readonly description = 'Makes the target appear with a scale animation.';
readonly category: MotionCategory = 'entrance';
```

Guidelines:

```txt
type
  Stable machine name. It is used by the registry and MotionConfig.

label
  Human-readable name. Useful for builder UIs and documentation.

description
  Human-readable explanation of what the motion does.

category
  Semantic group such as entrance, exit or emphasis.
```

Keep `type` stable once published. Renaming it is a breaking change for users.

### 4.2 Options schema

Options are defined once with `defineMotionOptions()`.

```ts
const scaleInMotionOptions = defineMotionOptions({
  fromScale: option.range({
    label: 'From scale',
    defaultValue: 0.9,
    min: 0,
    max: 2,
    step: 0.05,
    unit: 'none'
  })
});
```

This single schema produces:

```txt
optionDefinitions
  Public metadata for editor/builder UIs.

getDefaultOptions()
  Typed default option object.

normalizeOptions()
  Typed normalized option object from raw input.

InferMotionOptions
  TypeScript type inferred from the schema.
```

Do not duplicate defaults manually in `getDefaultOptions()`.

Do not duplicate normalization manually in `normalizeOptions()`.

Do not write `optionDefinitions` manually when `defineMotionOptions()` is enough.

### 4.3 Inferred option type

Use `InferMotionOptions` to derive the public option type from the schema.

```ts
export type ScaleInMotionOptions = InferMotionOptions<typeof scaleInMotionOptions.schema>;
```

This avoids keeping a separate hand-written type in sync with the schema.

### 4.4 Option validators

Use `optionValidators` for semantic rules that cannot be expressed by a single option.

Example:

```ts
protected override readonly optionValidators = [
  validateIncreasing('fromScale', 'toScale', 'Scale in value must increase')
];
```

Use validators for relationship rules:

```txt
fromScale < toScale
fromOpacity > toOpacity
startDelay <= endDelay
minValue <= maxValue
```

Do not use validators for simple clamping. The option builder already handles normalizing basic values.

### 4.5 Timeline building

`buildTimeline()` converts typed options into a serializable `MotionTimelineDefinition`.

```ts
buildTimeline(context: MotionBuildContext<ScaleInMotionOptions>): MotionTimelineDefinition {
  return createMotionTimeline((timeline) => {
    timeline.track('self', (track) => {
      track.step((step) => {
        step.from({ transform: 'scale(0.9)', opacity: 0 });
        step.to({ transform: 'scale(1)', opacity: 1 });
      });
    });
  });
}
```

Keep `createMotionTimeline()` explicit.

Do not add animation-specific shortcuts such as:

```txt
timeline.fade()
timeline.scale()
fadeTimeline()
scaleRecipe()
```

The engine should keep one powerful timeline model instead of many shortcut APIs.

## 5. Option builders

The current option builders are:

```txt
option.number()
option.range()
option.string()
option.boolean()
option.select()
option.color()
```

### 5.1 number

Use `number` for numeric values that may not be represented as a visual slider.

```ts
retries: option.number({
  label: 'Retries',
  defaultValue: 1,
  min: 0,
  max: 10
});
```

### 5.2 range

Use `range` for numeric values that are naturally edited with a slider.

```ts
distance: option.range({
  label: 'Distance',
  defaultValue: 24,
  min: 0,
  max: 300,
  step: 1,
  unit: 'px'
});
```

### 5.3 string

Use `string` for text values.

```ts
label: option.string({
  label: 'Label',
  defaultValue: 'Default label'
});
```

### 5.4 boolean

Use `boolean` for flags.

```ts
fade: option.boolean({
  label: 'Fade',
  defaultValue: true
});
```

### 5.5 select

Use `select` for a finite set of string choices.

```ts
direction: option.select({
  label: 'Direction',
  defaultValue: 'bottom',
  choices: [
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' }
  ] as const
});
```

Use `as const` on `choices` when you want TypeScript to infer a precise union type.

Without `as const`, TypeScript may widen the values to `string`.

### 5.6 color

Use `color` for color-like string values.

```ts
backgroundColor: option.color({
  label: 'Background color',
  defaultValue: '#000000'
});
```

The current color option normalizes to a string fallback. It does not yet parse or validate color formats strictly.

## 6. Option validators

The current reusable validators are:

```txt
validateDifferent()
validateGreaterThan()
validateGreaterThanOrEqual()
validateLessThan()
validateLessThanOrEqual()
validateIncreasing()
validateDecreasing()
```

### 6.1 validateDifferent

Use it when two values must not be the same.

```ts
validateDifferent('fromOpacity', 'toOpacity', 'Opacity values must be different');
```

### 6.2 validateGreaterThan

Use it when one numeric option must be strictly greater than another.

```ts
validateGreaterThan('toScale', 'fromScale', 'toScale must be greater than fromScale');
```

### 6.3 validateGreaterThanOrEqual

Use it when equality is allowed.

```ts
validateGreaterThanOrEqual(
  'maxDelay',
  'minDelay',
  'maxDelay must be greater than or equal to minDelay'
);
```

### 6.4 validateLessThan

Use it when one numeric option must be strictly less than another.

```ts
validateLessThan('fromOpacity', 'toOpacity', 'fromOpacity must be less than toOpacity');
```

### 6.5 validateLessThanOrEqual

Use it when equality is allowed.

```ts
validateLessThanOrEqual('minDelay', 'maxDelay', 'minDelay must be less than or equal to maxDelay');
```

### 6.6 validateIncreasing

Use it for semantic “from -> to” values that must increase.

```ts
validateIncreasing('fromOpacity', 'toOpacity', 'Fade in opacity must increase');
```

This is preferred for entrance-style options where the intent matters more than the raw comparison wording.

### 6.7 validateDecreasing

Use it for semantic “from -> to” values that must decrease.

```ts
validateDecreasing('fromOpacity', 'toOpacity', 'Fade out opacity must decrease');
```

This is preferred for exit-style options where the intent matters more than the raw comparison wording.

## 7. Normalization and validation order

A motion should normally be used like this:

```ts
const normalizedOptions = motion.normalizeOptions(rawOptions);
const validationErrors = motion.validateOptions(normalizedOptions);
```

Important rule:

```txt
normalizeOptions() handles raw user input.
validateOptions() checks semantic rules after normalization.
```

Example:

```ts
const normalized = motion.normalizeOptions({
  fromScale: -10,
  toScale: 999
});

// fromScale is clamped to 0
// toScale is clamped to 2
```

Then validators check whether the normalized values make semantic sense.

This means validators are not responsible for raw type parsing or clamping.

## 8. Reduced motion

A motion may optionally provide a reduced motion timeline.

Use this when the normal animation includes movement, scale, rotation or another effect that may be uncomfortable for some users.

```ts
override buildReducedMotionTimeline(
  context: MotionBuildContext<ScaleInMotionOptions>
): MotionTimelineDefinition {
  return createMotionTimeline((timeline) => {
    timeline.track('self', (track) => {
      track.step(
        {
          duration: Math.min(context.duration, 150),
          delay: 0,
          easing: 'ease-out',
          fill: 'both'
        },
        (step) => {
          step.from({ opacity: 0 });
          step.to({ opacity: 1 });
        }
      );
    });
  });
}
```

Use `override` because `SchemaMotionDefinition` declares `buildReducedMotionTimeline?()`.

Guidelines:

```txt
Prefer opacity over transform.
Avoid large movement.
Avoid rotation.
Keep duration short.
Remove delay unless there is a strong reason to keep it.
```

## 9. Registering a custom motion

A motion must be registered before it can be used by `motion.play()` with a `type`.

Example:

```ts
import { createMotionEngine } from '@tiqlyne/motion-core';
import { WebMotionDriver } from '@tiqlyne/motion-web';
import { ScaleInMotion } from './scale-in-motion';

const motion = createMotionEngine({
  driver: new WebMotionDriver()
});

motion.registry.register(new ScaleInMotion());

await motion.play(element, {
  type: 'scale-in',
  options: {
    fromScale: 0.9,
    toScale: 1,
    fade: true
  }
});
```

If the application uses a plugin or package registration function, register the motion there instead of registering it ad hoc in feature code.

## 10. Testing a custom motion

A custom motion should have tests for:

```txt
metadata
option definitions
default options
normalization
semantic validation
timeline output
reduced motion timeline, when implemented
```

### 10.1 Test metadata

```ts
it('exposes stable metadata', () => {
  const motion = new ScaleInMotion();

  expect(motion.type).toBe('scale-in');
  expect(motion.label).toBe('Scale in');
  expect(motion.category).toBe('entrance');
});
```

### 10.2 Test defaults

```ts
it('returns default options', () => {
  const motion = new ScaleInMotion();

  expect(motion.getDefaultOptions()).toEqual({
    fromScale: 0.9,
    toScale: 1,
    fade: true
  });
});
```

### 10.3 Test normalization

```ts
it('normalizes invalid options using fallback values', () => {
  const motion = new ScaleInMotion();

  expect(
    motion.normalizeOptions({
      fromScale: 'invalid',
      toScale: null,
      fade: 'yes'
    })
  ).toEqual({
    fromScale: 0.9,
    toScale: 1,
    fade: true
  });
});
```

### 10.4 Test semantic validation

```ts
it('validates that scale increases', () => {
  const motion = new ScaleInMotion();

  expect(
    motion.validateOptions({
      fromScale: 0.9,
      toScale: 1,
      fade: true
    })
  ).toEqual([]);
});

it('rejects decreasing scale values', () => {
  const motion = new ScaleInMotion();

  expect(
    motion.validateOptions({
      fromScale: 1,
      toScale: 0.9,
      fade: true
    })
  ).toEqual(['Scale in value must increase']);
});
```

### 10.5 Test timeline output

```ts
it('builds a valid scale-in timeline', () => {
  const motion = new ScaleInMotion();

  const timeline = motion.buildTimeline({
    options: {
      fromScale: 0.9,
      toScale: 1,
      fade: true
    },
    duration: 300,
    delay: 50,
    easing: 'ease-out',
    trigger: 'onEnter'
  });

  expect(timeline).toEqual({
    tracks: [
      {
        target: {
          type: 'self'
        },
        steps: [
          {
            duration: 300,
            delay: 50,
            easing: 'ease-out',
            fill: 'both',
            keyframes: [
              {
                transform: 'scale(0.9)',
                opacity: 0,
                offset: 0
              },
              {
                transform: 'scale(1)',
                opacity: 1,
                offset: 1
              }
            ]
          }
        ]
      }
    ]
  });
});
```

## 11. Choosing the right API level

### 11.1 SchemaMotionDefinition

Use this by default.

```txt
Best for:
- most plugin motions
- application motions
- builder-friendly motions
- motions with editable options
```

### 11.2 BaseMotionDefinition

Use this when the schema helpers are not enough, but you still want class convenience.

```txt
Best for:
- advanced option normalization
- unusual validation
- transitional legacy motions
```

### 11.3 Manual MotionDefinition

Use this only when you need full low-level control.

```txt
Best for:
- experiments
- integration tests
- very custom runtime behavior
- cases where no base class fits
```

Manual `MotionDefinition` must implement every required method and property itself.

## 12. Best practices

### 12.1 Keep one source of truth for options

Good:

```ts
const options = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
    defaultValue: 24,
    min: 0,
    max: 300
  })
});
```

Avoid:

```txt
optionDefinitions in one place
default values in another place
manual normalizeOptions somewhere else
manual TypeScript option type with duplicated fields
```

### 12.2 Keep timeline building explicit

Use `createMotionTimeline()` directly.

```ts
return createMotionTimeline((timeline) => {
  timeline.track('self', (track) => {
    track.step((step) => {
      step.from({ opacity: 0 });
      step.to({ opacity: 1 });
    });
  });
});
```

Do not hide timeline power behind animation-specific shortcuts.

### 12.3 Validate intent, not only difference

For directional values, prefer semantic validators.

Good:

```ts
validateIncreasing('fromOpacity', 'toOpacity', 'Fade in opacity must increase');
validateDecreasing('fromOpacity', 'toOpacity', 'Fade out opacity must decrease');
```

Avoid:

```ts
validateDifferent('fromOpacity', 'toOpacity', 'Opacity values must be different');
```

`validateDifferent()` only checks inequality. It does not check the intended direction.

### 12.4 Keep messages stable

Validation messages may be shown in tools or tests.

Keep them:

```txt
clear
stable
specific to the motion intent
```

Example:

```txt
Scale in value must increase
Fade out opacity must decrease
```

### 12.5 Do not put DOM logic in core motions

A `MotionDefinition` should build a serializable timeline.

Do not read or mutate DOM inside `buildTimeline()`.

The driver is responsible for platform-specific execution.

## 13. Current limitations

The current custom motion API deliberately does not include:

```txt
validateWhen()
warning-level option validation
structured validation issues with code/path/level
option grouping metadata
option ordering metadata
visibleWhen/disabledWhen metadata
color format validation
animation-specific timeline shortcuts
CLI generator for motion classes
```

These may be added later, but they should not be documented as available until implemented and tested.

## 14. Checklist

Before publishing a custom motion, verify:

```txt
[ ] type is stable and unique
[ ] label and description are clear
[ ] category is correct
[ ] options are defined with defineMotionOptions()
[ ] public option type uses InferMotionOptions
[ ] option defaults are not duplicated manually
[ ] normalization is handled by option builders where possible
[ ] optionValidators express semantic rules
[ ] buildTimeline() returns a serializable timeline
[ ] reduced motion timeline exists if the motion uses strong movement/scale/rotation
[ ] tests cover defaults, normalization, validation and timeline output
[ ] the motion is registered before being used by motion.play()
```

## 15. Minimal template

Use this as a starting point for a new custom motion.

```ts
import {
  SchemaMotionDefinition,
  createMotionTimeline,
  defineMotionOptions,
  option,
  type InferMotionOptions,
  type MotionBuildContext,
  type MotionCategory,
  type MotionTimelineDefinition
} from '@tiqlyne/motion-core';

const customMotionOptions = defineMotionOptions({
  intensity: option.range({
    label: 'Intensity',
    defaultValue: 1,
    min: 0,
    max: 2,
    step: 0.05,
    unit: 'none'
  })
});

export type CustomMotionOptions = InferMotionOptions<typeof customMotionOptions.schema>;

export class CustomMotion extends SchemaMotionDefinition<typeof customMotionOptions.schema> {
  readonly type = 'custom-motion';
  readonly label = 'Custom motion';
  readonly description = 'Describe what this motion does.';
  readonly category: MotionCategory = 'emphasis';

  protected readonly options = customMotionOptions;

  buildTimeline(context: MotionBuildContext<CustomMotionOptions>): MotionTimelineDefinition {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step(
          {
            duration: context.duration,
            delay: context.delay,
            easing: context.easing,
            fill: 'both'
          },
          (step) => {
            step.from({ opacity: 0 });
            step.to({ opacity: context.options.intensity > 0 ? 1 : 0 });
          }
        );
      });
    });
  }
}
```
