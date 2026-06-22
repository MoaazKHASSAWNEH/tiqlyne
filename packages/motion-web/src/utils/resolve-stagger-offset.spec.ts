import { describe, expect, it } from 'vitest';
import { resolveStaggerOffset } from './resolve-stagger-offset';

describe('resolveStaggerOffset', () => {
  it('returns 0 when stagger is undefined', () => {
    expect(resolveStaggerOffset(undefined, 2, 4)).toBe(0);
  });

  it('resolves numeric stagger from start', () => {
    expect(resolveStaggerOffset(80, 0, 4)).toBe(0);
    expect(resolveStaggerOffset(80, 1, 4)).toBe(80);
    expect(resolveStaggerOffset(80, 2, 4)).toBe(160);
    expect(resolveStaggerOffset(80, 3, 4)).toBe(240);
  });

  it('resolves advanced stagger from start by default', () => {
    expect(resolveStaggerOffset({ each: 80 }, 0, 4)).toBe(0);
    expect(resolveStaggerOffset({ each: 80 }, 1, 4)).toBe(80);
    expect(resolveStaggerOffset({ each: 80 }, 2, 4)).toBe(160);
    expect(resolveStaggerOffset({ each: 80 }, 3, 4)).toBe(240);
  });

  it('resolves advanced stagger from end', () => {
    expect(resolveStaggerOffset({ each: 80, from: 'end' }, 0, 4)).toBe(240);
    expect(resolveStaggerOffset({ each: 80, from: 'end' }, 1, 4)).toBe(160);
    expect(resolveStaggerOffset({ each: 80, from: 'end' }, 2, 4)).toBe(80);
    expect(resolveStaggerOffset({ each: 80, from: 'end' }, 3, 4)).toBe(0);
  });

  it('resolves advanced stagger from center with odd target count', () => {
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 0, 5)).toBe(160);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 1, 5)).toBe(80);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 2, 5)).toBe(0);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 3, 5)).toBe(80);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 4, 5)).toBe(160);
  });

  it('resolves advanced stagger from center with even target count', () => {
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 0, 4)).toBe(80);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 1, 4)).toBe(0);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 2, 4)).toBe(0);
    expect(resolveStaggerOffset({ each: 80, from: 'center' }, 3, 4)).toBe(80);
  });
});
