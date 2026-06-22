export { WebMotionDriver, type WebMotionDriverOptions } from './drivers/web-motion-driver';
export { toWebKeyframes } from './utils/to-web-keyframes';

export { WebMotionPlaybackController } from './controllers/web-motion-playback-controller';

export {
  toWebScheduledTaskTimingOptions,
  toWebStepTimingOptions
} from './utils/to-web-timing-options';

export { resolveStaggerOffset } from './utils/resolve-stagger-offset';

export {
  resolveWebTarget,
  resolveWebTargets,
  resolveWebTrackTargets
} from './utils/resolve-web-targets';

export {
  createWebAnimationFromStep,
  createWebAnimationsFromScheduledTask
} from './utils/create-web-animation';

export const motionWebVersion = '0.1.0';
