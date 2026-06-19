import type { MotionRegistry } from '@structifyx/motion-core';
import { FadeInMotion } from '../motions/fade-in-motion';

export function registerBasicMotions(registry: MotionRegistry): void {
  registry.register(new FadeInMotion());
}