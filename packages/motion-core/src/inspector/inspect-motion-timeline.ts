import { prepareMotionTimeline } from '../compiler/prepare-motion-timeline';
import {
  createMotionInfoDiagnostic,
  createMotionWarningDiagnostic
} from '../diagnostics/create-motion-diagnostic';
import { MotionDiagnosticCodes } from '../diagnostics/motion-diagnostic-code';
import { MotionDiagnosticSources } from '../diagnostics/motion-diagnostic-source';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';
import type { PreparedMotionStep } from '../models/prepared-motion-timeline';
import type { MotionTargetReference } from '../models/motion-target';
import type { MotionTimelineDefinition } from '../models/motion-timeline';
import type {
  MotionTimelineInspection,
  MotionTimelineLabelInspection,
  MotionTimelineStepInspection,
  MotionTimelineTrackInspection
} from './motion-timeline-inspection';

const LONG_TIMELINE_DURATION = 3000;
const LONG_STEP_DURATION = 1500;
const INSPECTOR_DIAGNOSTIC_SOURCE = MotionDiagnosticSources.TimelineInspector;

/**
 * Inspects a timeline and returns a developer-friendly report.
 *
 * The inspector prepares the timeline, summarizes tracks, labels, targets,
 * animated properties and produces lightweight diagnostics for suspicious
 * timelines such as infinite timelines, very long timelines or empty steps.
 *
 * @param timeline - Timeline to inspect.
 * @returns Timeline inspection report.
 */
export function inspectMotionTimeline(
  timeline: MotionTimelineDefinition
): MotionTimelineInspection {
  const preparedTimeline = prepareMotionTimeline(timeline);
  const labels = inspectLabels(timeline.labels);
  const diagnostics: MotionDiagnostic[] = [];

  const tracks = preparedTimeline.tracks.map((track): MotionTimelineTrackInspection => {
    const steps = track.steps.map((step): MotionTimelineStepInspection => inspectStep(step));

    return {
      trackIndex: track.trackIndex,
      target: track.target,
      stepCount: steps.length,
      animatedProperties: uniqueStrings(steps.flatMap((step) => step.animatedProperties)),
      steps
    };
  });

  const allSteps = tracks.flatMap((track) => track.steps);

  diagnostics.push(...inspectTimelineDiagnostics(preparedTimeline.totalDuration, allSteps));
  diagnostics.push(...inspectStepDiagnostics(allSteps));

  return {
    totalDuration: preparedTimeline.totalDuration,
    trackCount: tracks.length,
    stepCount: allSteps.length,
    labelCount: labels.length,
    labels,
    targets: uniqueTargets(tracks.map((track) => track.target)),
    animatedProperties: uniqueStrings(allSteps.flatMap((step) => step.animatedProperties)),
    tracks,
    diagnostics
  };
}

function inspectLabels(
  labels: MotionTimelineDefinition['labels']
): ReadonlyArray<MotionTimelineLabelInspection> {
  if (labels === undefined) {
    return [];
  }

  return Object.entries(labels)
    .map(([name, time]) => ({
      name,
      time
    }))
    .sort((left, right) => left.time - right.time);
}

function inspectStep(step: PreparedMotionStep): MotionTimelineStepInspection {
  const animatedProperties = inspectAnimatedProperties(step.keyframes);

  return {
    trackIndex: step.trackIndex,
    stepIndex: step.stepIndex,
    startTime: step.startTime,
    endTime: step.endTime,
    duration: step.duration,
    delay: step.delay,
    activeDuration: step.activeDuration,
    iterations: step.iterations ?? 1,
    animatedProperties,
    keyframeCount: step.keyframes.length,
    infinite: step.iterations === 'infinite'
  };
}

function inspectAnimatedProperties(
  keyframes: ReadonlyArray<MotionKeyframe>
): ReadonlyArray<string> {
  const properties: string[] = [];

  for (const keyframe of keyframes) {
    for (const key of Object.keys(keyframe)) {
      if (key === 'offset' || key === 'custom') {
        continue;
      }

      properties.push(key);
    }

    if (keyframe.custom !== undefined) {
      properties.push(...Object.keys(keyframe.custom).map((key) => `custom.${key}`));
    }
  }

  return [...uniqueStrings(properties)].sort();
}

function inspectTimelineDiagnostics(
  totalDuration: number,
  steps: ReadonlyArray<MotionTimelineStepInspection>
): ReadonlyArray<MotionDiagnostic> {
  const diagnostics: MotionDiagnostic[] = [];

  if (totalDuration === Infinity || steps.some((step) => step.infinite)) {
    diagnostics.push(
      createMotionInfoDiagnostic(
        MotionDiagnosticCodes.TimelineInspectionInfiniteTimeline,
        'Timeline contains infinite playback.',
        INSPECTOR_DIAGNOSTIC_SOURCE
      )
    );
  }

  if (Number.isFinite(totalDuration) && totalDuration > LONG_TIMELINE_DURATION) {
    diagnostics.push(
      createMotionWarningDiagnostic(
        MotionDiagnosticCodes.TimelineInspectionLongTimeline,
        'Timeline total duration is longer than the recommended V1 default.',
        INSPECTOR_DIAGNOSTIC_SOURCE,
        {
          totalDuration,
          recommendedMaxDuration: LONG_TIMELINE_DURATION
        }
      )
    );
  }

  return diagnostics;
}

function inspectStepDiagnostics(
  steps: ReadonlyArray<MotionTimelineStepInspection>
): ReadonlyArray<MotionDiagnostic> {
  const diagnostics: MotionDiagnostic[] = [];

  for (const step of steps) {
    if (step.keyframeCount === 0) {
      diagnostics.push(
        createMotionWarningDiagnostic(
          MotionDiagnosticCodes.TimelineInspectionEmptyStepKeyframes,
          'Timeline step has no keyframes.',
          INSPECTOR_DIAGNOSTIC_SOURCE,
          {
            trackIndex: step.trackIndex,
            stepIndex: step.stepIndex
          }
        )
      );
    }

    if (Number.isFinite(step.duration) && step.duration > LONG_STEP_DURATION) {
      diagnostics.push(
        createMotionWarningDiagnostic(
          MotionDiagnosticCodes.TimelineInspectionLongStep,
          'Timeline step duration is longer than the recommended V1 default.',
          INSPECTOR_DIAGNOSTIC_SOURCE,
          {
            trackIndex: step.trackIndex,
            stepIndex: step.stepIndex,
            duration: step.duration,
            recommendedMaxDuration: LONG_STEP_DURATION
          }
        )
      );
    }
  }

  return diagnostics;
}

function uniqueStrings(values: ReadonlyArray<string>): ReadonlyArray<string> {
  return Array.from(new Set(values));
}

function uniqueTargets(
  values: ReadonlyArray<MotionTargetReference>
): ReadonlyArray<MotionTargetReference> {
  const seen = new Set<string>();
  const targets: MotionTargetReference[] = [];

  for (const target of values) {
    const key = JSON.stringify(target);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    targets.push(target);
  }

  return targets;
}
