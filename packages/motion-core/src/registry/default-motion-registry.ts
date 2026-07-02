import type { MotionDefinition } from '../contracts/motion-definition';
import type { MotionRegistry } from '../contracts/motion-registry';
import type { MotionCategory } from '../models/motion-category';

/**
 * Default in-memory implementation of {@link MotionRegistry}.
 *
 * This registry is suitable for applications, tests and basic motion packs.
 * It stores definitions by their public `type` and rejects duplicate types.
 */
export class DefaultMotionRegistry implements MotionRegistry {
  private readonly definitions = new Map<string, MotionDefinition<object>>();

  /**
   * Registers a motion definition.
   *
   * @throws Error when another definition with the same type is already registered.
   */
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Motion already registered: ${definition.type}`);
    }

    this.definitions.set(definition.type, definition as MotionDefinition<object>);
  }

  /**
   * Checks whether a motion type is registered.
   */
  has(type: string): boolean {
    return this.definitions.has(type);
  }

  /**
   * Gets a registered motion definition by type.
   */
  get(type: string): MotionDefinition<object> | undefined {
    return this.definitions.get(type);
  }

  /**
   * Gets all registered motion definitions.
   */
  getAll(): ReadonlyArray<MotionDefinition<object>> {
    return Array.from(this.definitions.values());
  }

  /**
   * Gets registered motion definitions matching a category.
   */
  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>> {
    return this.getAll().filter((definition) => definition.category === category);
  }
}
