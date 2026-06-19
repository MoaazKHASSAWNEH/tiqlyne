import { describe, expect, it } from 'vitest';
import type {
  MotionBuildContext,
  MotionDefinition
} from '../contracts/motion-definition';
import type { MotionCategory } from '../models/motion-category';
import type { MotionOptionDefinition } from '../models/motion-option-definition';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import { DefaultMotionRegistry } from './default-motion-registry';

type TestMotionOptions = {
  readonly intensity: number;
};

class TestMotionDefinition implements MotionDefinition<TestMotionOptions> {
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly category: MotionCategory;
  readonly optionDefinitions: ReadonlyArray<MotionOptionDefinition> = [];

  constructor(
    type = 'test-motion',
    category: MotionCategory = 'custom'
  ) {
    this.type = type;
    this.label = `Test ${type}`;
    this.description = `Test motion definition for ${type}`;
    this.category = category;
  }

  getDefaultOptions(): TestMotionOptions {
    return {
      intensity: 1
    };
  }

  normalizeOptions(): TestMotionOptions {
    return this.getDefaultOptions();
  }

  buildTimeline(
    _context: MotionBuildContext<TestMotionOptions>
  ): MotionTimelineDefinition {
    return {
      tracks: []
    };
  }
}

describe('DefaultMotionRegistry', () => {
  it('registers a motion definition', () => {
    const registry = new DefaultMotionRegistry();
    const definition = new TestMotionDefinition();

    registry.register(definition);

    expect(registry.has('test-motion')).toBe(true);
    expect(registry.get('test-motion')).toBe(definition);
  });

  it('throws when registering duplicate motion type', () => {
    const registry = new DefaultMotionRegistry();

    registry.register(new TestMotionDefinition('fade-in'));

    expect(() => {
      registry.register(new TestMotionDefinition('fade-in'));
    }).toThrow('Motion already registered: fade-in');
  });

  it('returns undefined for unknown motion type', () => {
    const registry = new DefaultMotionRegistry();

    expect(registry.get('unknown')).toBeUndefined();
    expect(registry.has('unknown')).toBe(false);
  });

  it('returns all registered motion definitions', () => {
    const registry = new DefaultMotionRegistry();

    const fadeIn = new TestMotionDefinition('fade-in', 'entrance');
    const shake = new TestMotionDefinition('shake', 'feedback');

    registry.register(fadeIn);
    registry.register(shake);

    expect(registry.getAll()).toEqual([fadeIn, shake]);
  });

  it('filters motion definitions by category', () => {
    const registry = new DefaultMotionRegistry();

    const fadeIn = new TestMotionDefinition('fade-in', 'entrance');
    const slideIn = new TestMotionDefinition('slide-in', 'entrance');
    const shake = new TestMotionDefinition('shake', 'feedback');

    registry.register(fadeIn);
    registry.register(slideIn);
    registry.register(shake);

    expect(registry.getByCategory('entrance')).toEqual([fadeIn, slideIn]);
    expect(registry.getByCategory('feedback')).toEqual([shake]);
    expect(registry.getByCategory('exit')).toEqual([]);
  });
});