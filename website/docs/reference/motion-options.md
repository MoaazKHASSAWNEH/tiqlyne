---
sidebar_position: 5
---

# Motion options

Option schemas provide runtime normalization, inferred TypeScript types, and metadata for documentation or visual tooling.

```ts
import { defineMotionOptions, option, type InferMotionOptions } from '@tiqlyne/motion-core';

const entranceOptions = defineMotionOptions({
  distance: option.range({
    label: 'Distance',
    description: 'Travel in pixels.',
    defaultValue: 24,
    min: 0,
    max: 300,
    step: 1,
    unit: 'px'
  }),
  delayPerItem: option.number({
    label: 'Delay per item',
    defaultValue: 40,
    min: 0,
    unit: 'ms'
  }),
  direction: option.select({
    label: 'Direction',
    defaultValue: 'bottom',
    choices: [
      { label: 'Top', value: 'top' },
      { label: 'Bottom', value: 'bottom' }
    ] as const
  }),
  fade: option.boolean({ label: 'Fade', defaultValue: true }),
  label: option.string({ label: 'Label', defaultValue: 'Entrance' }),
  accent: option.color({ label: 'Accent', defaultValue: '#6366f1' })
});

type EntranceOptions = InferMotionOptions<typeof entranceOptions.schema>;
```

## Builders and metadata

| Builder          | Normalized value                                                                       | Specific metadata                                     |
| ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `option.number`  | finite number or default; clamped only when both `min` and `max` are supplied in 0.1.0 | `step?`, `unit?`                                      |
| `option.range`   | number clamped to required `min`/`max`                                                 | `step?`, `unit?`                                      |
| `option.string`  | non-blank string or default                                                            | `minLength?`, `maxLength?` are metadata only in 0.1.0 |
| `option.boolean` | boolean or default                                                                     | —                                                     |
| `option.select`  | allowed choice value or default                                                        | required `choices`                                    |
| `option.color`   | string or default                                                                      | color format is not validated                         |

Every builder also requires `label` and `defaultValue`, and accepts `description`. Numeric units are `px`, `%`, `deg`, `ms`, `s`, and `none`.

`defineMotionOptions` returns `schema`, `optionDefinitions`, `getDefaultOptions()`, and `normalizeOptions(input)`. Unknown input keys are dropped. `normalizeMotionOptions(schema, input)` exposes the same low-level normalization directly.

## Cross-field validation

```ts
const errors = runMotionOptionValidators({ from: 0, to: 1 }, [
  validateIncreasing('from', 'to', 'Opacity must increase')
]);
```

Public validators are `validateIncreasing`, `validateDecreasing`, `validateDifferent`, `validateGreaterThan`, `validateGreaterThanOrEqual`, `validateLessThan`, and `validateLessThanOrEqual`. Each returns a validator producing either `null` or its configured message. `runMotionOptionValidators` collects all messages.

Common mistakes are expecting schema metadata such as `step` or string length to enforce validation, forgetting `as const` on select choices, and treating normalization as cross-field validation.

## Related pages

- [Custom motion definition](../guides/custom-motion-definition.md)
- [Motion definition reference](./motion-definition.md)
- [Basic pack options](./basic-pack.md)
