import type { MotionCompositionDefinition } from './motion-composition-definition';
import { MotionCompositionBuilder } from './motion-composition-builder';

export type MotionCompositionBuilderCallback = (builder: MotionCompositionBuilder) => void;

export function createMotionComposition(
  callback: MotionCompositionBuilderCallback
): MotionCompositionDefinition {
  const builder = new MotionCompositionBuilder();

  callback(builder);

  return builder.build();
}
