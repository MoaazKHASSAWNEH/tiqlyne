import type { MotionConflictStrategy, MotionPlayOptions } from '@tiqlyne/motion-core';

export type WebConflictOptions = {
  readonly cancelPreviousAnimations?: boolean;
};

export function getEffectiveWebConflictStrategy(
  options: MotionPlayOptions,
  webOptions: WebConflictOptions = {}
): MotionConflictStrategy {
  if (webOptions.cancelPreviousAnimations === false && options.conflictStrategy === 'replace') {
    return 'parallel';
  }

  return options.conflictStrategy;
}

export function isActiveWebAnimation(animation: Animation): boolean {
  return animation.playState === 'running' || animation.playState === 'paused' || animation.pending;
}

export function hasActiveWebAnimations(targets: ReadonlyArray<Element>): boolean {
  return targets.some((target) =>
    target
      .getAnimations({
        subtree: true
      })
      .some((animation) => isActiveWebAnimation(animation))
  );
}

export function cancelWebAnimations(targets: ReadonlyArray<Element>): void {
  for (const target of targets) {
    target.getAnimations({ subtree: true }).forEach((animation) => {
      animation.cancel();
    });
  }
}
