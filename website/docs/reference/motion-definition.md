---
sidebar_position: 4
---

# Motion definition

`MotionDefinition<TOptions>` describes one reusable, platform-independent motion.

```ts
interface MotionDefinition<TOptions extends object = object> {
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly category: MotionCategory;
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition>;
  getDefaultOptions(): TOptions;
  normalizeOptions(options: Record<string, unknown> | undefined): TOptions;
  validateOptions?(options: TOptions): ReadonlyArray<string>;
  buildTimeline(context: MotionBuildContext<TOptions>): MotionTimelineDefinition;
  buildReducedMotionTimeline?(context: MotionBuildContext<TOptions>): MotionTimelineDefinition;
}
```

`MotionCategory` is `entrance`, `exit`, `attention`, `feedback`, `interaction`, `transition`, or `custom`.

## Build context

`MotionBuildContext<TOptions>` contains normalized `options`, resolved `duration`, `delay`, `easing`, and `trigger`. It contains no DOM target; definitions build symbolic tracks.

## Lifecycle

The engine looks up `type`, calls `normalizeOptions`, collects optional validation messages, builds the main timeline, applies engine defaults, and validates it. With `simplify`, it also builds and validates the optional reduced timeline. Validation messages cause `invalid-motion-options`.

## Base classes

`BaseMotionDefinition<TOptions>` supplies a permissive `validateOptions` implementation but requires metadata, option definitions, defaults, normalization, and timeline building.

`SchemaMotionDefinition<TSchema>` connects a `defineMotionOptions` schema to inferred options. It provides `optionDefinitions`, defaults, normalization, and validator execution; subclasses provide metadata, schema, and `buildTimeline`.

```ts
const options = defineMotionOptions({
  from: option.range({
    label: 'From opacity',
    defaultValue: 0,
    min: 0,
    max: 1,
    unit: 'none'
  })
});

class FadeMotion extends SchemaMotionDefinition<typeof options.schema> {
  readonly type = 'app-fade';
  readonly label = 'App fade';
  readonly description = 'Fades application content in.';
  readonly category = 'entrance' as const;
  protected readonly options = options;

  buildTimeline(context: MotionBuildContext<InferMotionOptions<typeof options.schema>>) {
    return createMotionTimeline((timeline) => {
      timeline.track('self', (track) => {
        track.step({ duration: context.duration, easing: context.easing }, (step) => {
          step.from({ opacity: context.options.from });
          step.to({ opacity: 1 });
        });
      });
    });
  }
}
```

Use stable kebab-case types, expose useful builder metadata, normalize all untrusted input, return clear validation messages, and provide a reduced timeline for large/spatial motion. Never access the DOM, WAAPI, or a framework inside a core definition; target resolution belongs to drivers.

## Related pages

- [Custom motion definition guide](../guides/custom-motion-definition.md)
- [Motion options](./motion-options.md)
- [Timeline builder](./timeline-builder.md)
