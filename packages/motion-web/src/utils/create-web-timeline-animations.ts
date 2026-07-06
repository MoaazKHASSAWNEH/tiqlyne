import {
  MotionPlaybackResultReasons,
  type MotionTimelineDefinition,
  type ScheduledMotionTask,
  type ScheduledMotionTimeline
} from '@tiqlyne/motion-core';
import {
  createWebAnimationFromStep,
  createWebAnimationsFromScheduledTask as createWebAnimationsFromScheduledTaskTargets
} from './create-web-animation';
import { resolveStaggerOffset } from './resolve-stagger-offset';
import { resolveWebTargets } from './resolve-web-targets';

export type WebTimelineAnimationCreationFailureReason =
  typeof MotionPlaybackResultReasons.TargetNotFound;

export type WebTimelineAnimationCreationResult =
  | {
      readonly ok: true;
      readonly animations: ReadonlyArray<Animation>;
    }
  | {
      readonly ok: false;
      readonly animations: ReadonlyArray<Animation>;
      readonly reason: WebTimelineAnimationCreationFailureReason;
    };

export function createWebAnimationsFromTimeline(
  root: Element,
  timeline: MotionTimelineDefinition
): WebTimelineAnimationCreationResult {
  const animations: Animation[] = [];

  for (const track of timeline.tracks) {
    const trackTargets = resolveWebTargets(root, track.target);

    if (trackTargets.length === 0) {
      return {
        ok: false,
        animations,
        reason: MotionPlaybackResultReasons.TargetNotFound
      };
    }

    for (const step of track.steps) {
      for (const [targetIndex, trackTarget] of trackTargets.entries()) {
        const staggerOffset = resolveStaggerOffset(track.stagger, targetIndex, trackTargets.length);

        animations.push(createWebAnimationFromStep(trackTarget, step, staggerOffset));
      }
    }
  }

  return {
    ok: true,
    animations
  };
}

export function createWebAnimationsFromScheduledTimeline(
  root: Element,
  scheduledTimeline: ScheduledMotionTimeline
): WebTimelineAnimationCreationResult {
  const animations: Animation[] = [];

  for (const task of scheduledTimeline.tasks) {
    const taskAnimations = createWebAnimationsFromScheduledTask(root, scheduledTimeline, task);

    if (!taskAnimations) {
      return {
        ok: false,
        animations,
        reason: MotionPlaybackResultReasons.TargetNotFound
      };
    }

    animations.push(...taskAnimations);
  }

  return {
    ok: true,
    animations
  };
}

function createWebAnimationsFromScheduledTask(
  root: Element,
  scheduledTimeline: ScheduledMotionTimeline,
  task: ScheduledMotionTask
): ReadonlyArray<Animation> | null {
  const track = scheduledTimeline.source.tracks[task.trackIndex];

  if (!track) {
    return null;
  }

  const taskTargets = resolveWebTargets(root, track.target);

  if (taskTargets.length === 0) {
    return null;
  }

  return createWebAnimationsFromScheduledTaskTargets(taskTargets, task, track.stagger);
}
