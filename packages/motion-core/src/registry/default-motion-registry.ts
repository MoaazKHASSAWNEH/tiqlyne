import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionDefinition } from '../contracts/motion-definition';
import type { MotionCategory } from '../models/motion-category';

export class DefaultMotionRegistry implements MotionRegistry {
  private readonly definitions = new Map<string, MotionDefinition<object>>();

  register<TOptions extends object>(
    definition: MotionDefinition<TOptions>
  ): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Motion already registered: ${definition.type}`);
    }

    this.definitions.set(
      definition.type,
      definition as MotionDefinition<object>
    );
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  get(type: string): MotionDefinition<object> | undefined {
    return this.definitions.get(type);
  }

  getAll(): ReadonlyArray<MotionDefinition<object>> {
    return Array.from(this.definitions.values());
  }

  getByCategory(
    category: MotionCategory
  ): ReadonlyArray<MotionDefinition<object>> {
    return this.getAll().filter((definition) => definition.category === category);
  }
}