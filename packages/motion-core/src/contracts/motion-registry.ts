import type { MotionCategory } from '../models/motion-category';
import type { MotionDefinition } from './motion-definition';

/**
 * Registry of available motion definitions.
 *
 * The registry lets the engine discover motions dynamically without hardcoding
 * motion classes in the core. Packs and applications register definitions here,
 * then configs can reference them by `type`.
 */
export interface MotionRegistry {
  /**
   * Registers a motion definition.
   *
   * Implementations should reject duplicate motion types.
   *
   * @typeParam TOptions - Strongly typed options accepted by the definition.
   * @param definition - Motion definition to register.
   */
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): void;

  /**
   * Checks whether a motion type is registered.
   *
   * @param type - Motion type identifier.
   * @returns `true` when the type exists.
   */
  has(type: string): boolean;

  /**
   * Gets a registered motion definition by type.
   *
   * @param type - Motion type identifier.
   * @returns Matching definition, or `undefined` when not found.
   */
  get(type: string): MotionDefinition<object> | undefined;

  /**
   * Gets all registered motion definitions.
   *
   * @returns A readonly list of all definitions.
   */
  getAll(): ReadonlyArray<MotionDefinition<object>>;

  /**
   * Gets registered motion definitions by category.
   *
   * @param category - Category used to filter definitions.
   * @returns A readonly list of matching definitions.
   */
  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>;
}
