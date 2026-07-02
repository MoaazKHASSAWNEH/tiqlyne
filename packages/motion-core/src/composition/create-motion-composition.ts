import { MotionCompositionBuilder } from './motion-composition-builder';
import type { MotionCompositionDefinition } from './motion-composition-definition';

/**
 * Callback used by {@link createMotionComposition}.
 *
 * The callback receives a composition builder and should add motion or timeline
 * items before the composition is built.
 */
export type MotionCompositionBuilderCallback = (builder: MotionCompositionBuilder) => void;

/**
 * Creates a motion composition using the fluent composition builder API.
 *
 * A composition groups registered motions and direct timelines into a single
 * compiled timeline. It is useful for complex UI sequences that need labels,
 * offsets or reusable blocks.
 *
 * @param callback - Function that receives and configures the composition builder.
 * @returns Built composition definition.
 */
export function createMotionComposition(
  callback: MotionCompositionBuilderCallback
): MotionCompositionDefinition {
  const builder = new MotionCompositionBuilder();

  callback(builder);

  return builder.build();
}
