import type { MotionTimelineDefinition } from '@structifyx/motion-core';

type TimelineTargetReference = MotionTimelineDefinition['tracks'][number]['target'];

export function resolveWebTarget(root: Element, target: TimelineTargetReference): Element | null {
  switch (target.type) {
    case 'self':
      return root;

    case 'child':
      return root.querySelector(`[data-motion-child="${target.name}"]`);

    case 'selector':
      return root.querySelector(target.selector);

    case 'named':
      return document.querySelector(`[data-motion-name="${target.name}"]`);
  }
}

export function resolveWebTargets(
  root: Element,
  target: TimelineTargetReference
): ReadonlyArray<Element> {
  switch (target.type) {
    case 'self':
      return [root];

    case 'child': {
      const element = root.querySelector(`[data-motion-child="${target.name}"]`);

      return element ? [element] : [];
    }

    case 'selector':
      return Array.from(root.querySelectorAll(target.selector));

    case 'named': {
      const element = document.querySelector(`[data-motion-name="${target.name}"]`);

      return element ? [element] : [];
    }
  }
}

export function resolveWebTrackTargets(
  root: Element,
  timeline: MotionTimelineDefinition
): ReadonlyArray<Element> | null {
  const targets: Element[] = [];

  for (const track of timeline.tracks) {
    const resolvedTargets = resolveWebTargets(root, track.target);

    if (resolvedTargets.length === 0) {
      return null;
    }

    targets.push(...resolvedTargets);
  }

  return targets;
}
