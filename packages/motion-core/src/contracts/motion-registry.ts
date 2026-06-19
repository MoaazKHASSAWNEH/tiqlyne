import type { MotionDefinition } from './motion-definition';
import type { MotionCategory } from '../models/motion-category';

export interface MotionRegistry {
  register<TOptions extends object>(
    definition: MotionDefinition<TOptions>
  ): void;

  has(type: string): boolean;

  get(type: string): MotionDefinition<object> | undefined;

  getAll(): ReadonlyArray<MotionDefinition<object>>;

  getByCategory(
    category: MotionCategory
  ): ReadonlyArray<MotionDefinition<object>>;
}