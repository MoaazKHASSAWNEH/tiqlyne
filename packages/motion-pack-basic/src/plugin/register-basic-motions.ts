import type { MotionRegistry } from '@structifyx/motion-core';
import { FadeInMotion } from '../motions/fade-in-motion';
import { FadeOutMotion } from '../motions/fade-out-motion';
import { SlideInMotion } from '../motions/slide-in-motion';

export function registerBasicMotions(registry: MotionRegistry): void {
  registry.register(new FadeInMotion());
  registry.register(new FadeOutMotion());
  registry.register(new SlideInMotion());
}
