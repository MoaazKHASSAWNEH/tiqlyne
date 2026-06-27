import { describe, expect, it } from 'vitest';
import { defineMotionOptions } from './define-motion-options';
import type { InferMotionOptions } from './infer-motion-options';
import { option } from './motion-option-builders';
import { runMotionOptionValidators, validateDifferent } from './motion-option-validator';

describe('defineMotionOptions', () => {
  it('creates option definitions with generated names', () => {
    const options = defineMotionOptions({
      distance: option.number({
        label: 'Distance',
        defaultValue: 24,
        min: 0,
        max: 300,
        unit: 'px'
      }),
      fade: option.boolean({
        label: 'Fade',
        defaultValue: true
      })
    });

    expect(options.optionDefinitions).toEqual([
      {
        name: 'distance',
        label: 'Distance',
        type: 'number',
        defaultValue: 24,
        min: 0,
        max: 300,
        unit: 'px'
      },
      {
        name: 'fade',
        label: 'Fade',
        type: 'boolean',
        defaultValue: true
      }
    ]);
  });

  it('returns default options from the schema', () => {
    const options = defineMotionOptions({
      opacity: option.number({
        label: 'Opacity',
        defaultValue: 1,
        min: 0,
        max: 1
      }),
      enabled: option.boolean({
        label: 'Enabled',
        defaultValue: true
      }),
      name: option.string({
        label: 'Name',
        defaultValue: 'default'
      })
    });

    expect(options.getDefaultOptions()).toEqual({
      opacity: 1,
      enabled: true,
      name: 'default'
    });
  });

  it('normalizes number, boolean, string and color options', () => {
    const options = defineMotionOptions({
      opacity: option.number({
        label: 'Opacity',
        defaultValue: 1,
        min: 0,
        max: 1
      }),
      enabled: option.boolean({
        label: 'Enabled',
        defaultValue: true
      }),
      title: option.string({
        label: 'Title',
        defaultValue: 'Default title'
      }),
      color: option.color({
        label: 'Color',
        defaultValue: '#ffffff'
      })
    });

    expect(
      options.normalizeOptions({
        opacity: 2,
        enabled: 'yes',
        title: '',
        color: '#000000'
      })
    ).toEqual({
      opacity: 1,
      enabled: true,
      title: 'Default title',
      color: '#000000'
    });
  });

  it('normalizes select options using allowed choices', () => {
    const options = defineMotionOptions({
      direction: option.select({
        label: 'Direction',
        defaultValue: 'bottom',
        choices: [
          {
            label: 'Top',
            value: 'top'
          },
          {
            label: 'Bottom',
            value: 'bottom'
          }
        ] as const
      })
    });

    expect(
      options.normalizeOptions({
        direction: 'top'
      })
    ).toEqual({
      direction: 'top'
    });

    expect(
      options.normalizeOptions({
        direction: 'left'
      })
    ).toEqual({
      direction: 'bottom'
    });
  });

  it('supports inferred option types', () => {
    const options = defineMotionOptions({
      direction: option.select({
        label: 'Direction',
        defaultValue: 'bottom',
        choices: [
          {
            label: 'Top',
            value: 'top'
          },
          {
            label: 'Bottom',
            value: 'bottom'
          }
        ] as const
      }),
      distance: option.range({
        label: 'Distance',
        defaultValue: 24,
        min: 0,
        max: 300,
        unit: 'px'
      })
    });

    type Options = InferMotionOptions<typeof options.schema>;

    const normalized: Options = options.normalizeOptions({
      direction: 'top',
      distance: 48
    });

    expect(normalized).toEqual({
      direction: 'top',
      distance: 48
    });
  });

  it('runs generic validators', () => {
    const errors = runMotionOptionValidators(
      {
        fromOpacity: 1,
        toOpacity: 1
      },
      [
        validateDifferent(
          'fromOpacity',
          'toOpacity',
          'fromOpacity and toOpacity must be different.'
        )
      ]
    );

    expect(errors).toEqual(['fromOpacity and toOpacity must be different.']);
  });
});
