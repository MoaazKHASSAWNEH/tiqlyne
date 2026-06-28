import { describe, expect, it } from 'vitest';
import {
  runMotionOptionValidators,
  validateDecreasing,
  validateDifferent,
  validateGreaterThan,
  validateGreaterThanOrEqual,
  validateIncreasing,
  validateLessThan,
  validateLessThanOrEqual
} from './motion-option-validator';

describe('motion option validators', () => {
  it('validates different values', () => {
    const validator = validateDifferent('fromOpacity', 'toOpacity', 'values must be different');

    expect(
      validator({
        fromOpacity: 0,
        toOpacity: 1
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 1
      })
    ).toBe('values must be different');
  });

  it('validates greater than', () => {
    const validator = validateGreaterThan('toOpacity', 'fromOpacity', 'to must be greater');

    expect(
      validator({
        fromOpacity: 0,
        toOpacity: 1
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 0
      })
    ).toBe('to must be greater');

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 1
      })
    ).toBe('to must be greater');
  });

  it('validates greater than or equal', () => {
    const validator = validateGreaterThanOrEqual(
      'toOpacity',
      'fromOpacity',
      'to must be greater or equal'
    );

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 1
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 0
      })
    ).toBe('to must be greater or equal');
  });

  it('validates less than', () => {
    const validator = validateLessThan('fromOpacity', 'toOpacity', 'from must be less');

    expect(
      validator({
        fromOpacity: 0,
        toOpacity: 1
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 0
      })
    ).toBe('from must be less');
  });

  it('validates less than or equal', () => {
    const validator = validateLessThanOrEqual(
      'fromOpacity',
      'toOpacity',
      'from must be less or equal'
    );

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 1
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 2,
        toOpacity: 1
      })
    ).toBe('from must be less or equal');
  });

  it('validates increasing values', () => {
    const validator = validateIncreasing('fromOpacity', 'toOpacity', 'opacity must increase');

    expect(
      validator({
        fromOpacity: 0,
        toOpacity: 1
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 0
      })
    ).toBe('opacity must increase');

    expect(
      validator({
        fromOpacity: 0.5,
        toOpacity: 0.5
      })
    ).toBe('opacity must increase');
  });

  it('validates decreasing values', () => {
    const validator = validateDecreasing('fromOpacity', 'toOpacity', 'opacity must decrease');

    expect(
      validator({
        fromOpacity: 1,
        toOpacity: 0
      })
    ).toBeNull();

    expect(
      validator({
        fromOpacity: 0,
        toOpacity: 1
      })
    ).toBe('opacity must decrease');

    expect(
      validator({
        fromOpacity: 0.5,
        toOpacity: 0.5
      })
    ).toBe('opacity must decrease');
  });

  it('treats non numeric values as invalid for numeric comparisons', () => {
    const validator = validateGreaterThan('toOpacity', 'fromOpacity', 'to must be greater');

    expect(
      validator({
        fromOpacity: 'invalid',
        toOpacity: 1
      })
    ).toBe('to must be greater');
  });

  it('runs validators and returns only failing messages', () => {
    const errors = runMotionOptionValidators(
      {
        fromOpacity: 1,
        toOpacity: 1
      },
      [
        validateDifferent('fromOpacity', 'toOpacity', 'values must be different'),
        validateIncreasing('fromOpacity', 'toOpacity', 'opacity must increase')
      ]
    );

    expect(errors).toEqual(['values must be different', 'opacity must increase']);
  });
});
