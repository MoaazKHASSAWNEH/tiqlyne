import type { MotionBuildContext } from '../contracts/motion-definition';
import { applyMotionStepDefaults } from '../compiler/apply-motion-timeline-defaults';
import { MotionPlanningError } from '../engine/motion-planning-error';
import type { MotionEasing } from '../models/motion-easing';
import type { MotionTargetReference } from '../models/motion-target';
import type {
  MotionAnchorStepPosition,
  MotionLabelStepPosition,
  MotionStepDefinition,
  MotionStepPosition,
  MotionTimelineDefaults,
  MotionTimelineDefinition,
  MotionTimelineLabels,
  MotionTrackDefinition
} from '../models/motion-timeline';
import type { MotionTriggerType } from '../models/motion-trigger';
import { validateMotionTimeline } from '../validators/validate-motion-timeline';
import type {
  CompileMotionCompositionContext,
  MotionCompositionDefinition,
  MotionCompositionItem,
  RegisteredMotionCompositionItem,
  TimelineCompositionItem
} from './motion-composition-definition';

const DEFAULT_TARGET: MotionTargetReference = {
  type: 'self'
};

const DEFAULT_DURATION = 300;
const DEFAULT_DELAY = 0;
const DEFAULT_EASING: MotionEasing = 'ease-out';
const DEFAULT_TRIGGER: MotionTriggerType = 'onEnter';

export function compileMotionComposition(
  composition: MotionCompositionDefinition,
  context: CompileMotionCompositionContext
): MotionTimelineDefinition {
  if (composition.items.length === 0) {
    throw new MotionPlanningError(
      'Motion composition must contain at least one item.',
      'composition-empty'
    );
  }

  const labels = buildCompositionLabels(composition);

  const tracks = composition.items.flatMap((item) =>
    compileMotionCompositionItem(item, composition, context)
  );

  const timeline: MotionTimelineDefinition = {
    tracks,
    ...(composition.defaults !== undefined || context.defaults !== undefined
      ? {
          defaults: {
            ...(context.defaults ?? {}),
            ...(composition.defaults ?? {})
          }
        }
      : {}),
    ...(labels !== undefined
      ? {
          labels
        }
      : {})
  };

  const validationResult = validateMotionTimeline(timeline, context.validation);

  if (!validationResult.valid) {
    throw new MotionPlanningError(
      'Compiled motion composition timeline is invalid.',
      'composition-invalid-timeline',
      validationResult.diagnostics
    );
  }

  return timeline;
}

function buildCompositionLabels(
  composition: MotionCompositionDefinition
): MotionTimelineLabels | undefined {
  const labels: Record<string, number> = {
    ...(composition.labels ?? {})
  };

  let hasLabels = Object.keys(labels).length > 0;

  for (const item of composition.items) {
    if (item.label === undefined) {
      continue;
    }

    if (hasCompositionLabel(labels, item.label)) {
      throw new MotionPlanningError(
        `Duplicate composition label: ${item.label}.`,
        'composition-duplicate-label'
      );
    }

    labels[item.label] = resolveCompositionItemLabelPosition(item, labels);
    hasLabels = true;
  }

  return hasLabels ? labels : undefined;
}

function resolveCompositionItemLabelPosition(
  item: MotionCompositionItem,
  labels: MotionTimelineLabels
): number {
  if (item.at === undefined) {
    return 0;
  }

  if (typeof item.at === 'number') {
    return item.at;
  }

  if (typeof item.at === 'string') {
    return resolveCompositionLabelReference(item.at, labels);
  }

  if ('label' in item.at) {
    return resolveCompositionLabelReference(item.at.label, labels) + (item.at.offset ?? 0);
  }

  throw new MotionPlanningError(
    'Composition item labels do not support anchor-based placement yet.',
    'composition-item-label-anchor-position-unsupported'
  );
}

function resolveCompositionLabelReference(label: string, labels: MotionTimelineLabels): number {
  if (!hasCompositionLabel(labels, label)) {
    throw new MotionPlanningError(
      `Composition item label references unknown label: ${label}.`,
      'composition-item-label-reference-missing'
    );
  }

  return labels[label] ?? 0;
}

function hasCompositionLabel(labels: MotionTimelineLabels, label: string): boolean {
  return Object.prototype.hasOwnProperty.call(labels, label);
}

function compileMotionCompositionItem(
  item: MotionCompositionItem,
  composition: MotionCompositionDefinition,
  context: CompileMotionCompositionContext
): ReadonlyArray<MotionTrackDefinition> {
  switch (item.kind) {
    case 'motion':
      return compileRegisteredMotionItem(item, composition, context);

    case 'timeline':
      return compileTimelineItem(item);

    default:
      return assertNever(item);
  }
}

function compileRegisteredMotionItem(
  item: RegisteredMotionCompositionItem,
  composition: MotionCompositionDefinition,
  context: CompileMotionCompositionContext
): ReadonlyArray<MotionTrackDefinition> {
  const definition = context.registry.get(item.type);

  if (!definition) {
    throw new MotionPlanningError(
      `Unknown motion type in composition: ${item.type}.`,
      'composition-item-unknown-motion-type'
    );
  }

  const options = definition.normalizeOptions(item.options);
  const validationErrors = definition.validateOptions?.(options) ?? [];

  if (validationErrors.length > 0) {
    throw new MotionPlanningError(
      `Motion composition item options are invalid for motion type: ${item.type}.`,
      'composition-item-invalid-options',
      [],
      validationErrors
    );
  }

  const buildContext: MotionBuildContext<object> = {
    options,
    duration:
      item.defaults?.duration ??
      composition.defaults?.duration ??
      context.defaults?.duration ??
      DEFAULT_DURATION,
    delay:
      item.defaults?.delay ??
      composition.defaults?.delay ??
      context.defaults?.delay ??
      DEFAULT_DELAY,
    easing:
      item.defaults?.easing ??
      composition.defaults?.easing ??
      context.defaults?.easing ??
      DEFAULT_EASING,
    trigger: DEFAULT_TRIGGER
  };

  const timeline = definition.buildTimeline(buildContext);

  return timeline.tracks.map((track) =>
    transformCompositionTrack(track, {
      ...(item.target !== undefined
        ? {
            target: item.target
          }
        : {}),
      ...(item.at !== undefined
        ? {
            at: item.at
          }
        : {}),
      ...(item.defaults !== undefined
        ? {
            defaults: item.defaults
          }
        : {})
    })
  );
}

function compileTimelineItem(item: TimelineCompositionItem): ReadonlyArray<MotionTrackDefinition> {
  return item.timeline.tracks.map((track) =>
    transformCompositionTrack(track, {
      ...(item.target !== undefined
        ? {
            target: item.target
          }
        : {}),
      ...(item.at !== undefined
        ? {
            at: item.at
          }
        : {}),
      ...(item.defaults !== undefined
        ? {
            defaults: item.defaults
          }
        : {})
    })
  );
}

type TransformCompositionTrackOptions = {
  readonly target?: MotionTargetReference;
  readonly at?: RegisteredMotionCompositionItem['at'];
  readonly defaults?: MotionTimelineDefaults;
};

function transformCompositionTrack(
  track: MotionTrackDefinition,
  options: TransformCompositionTrackOptions
): MotionTrackDefinition {
  const target = options.target ?? track.target ?? DEFAULT_TARGET;

  const steps = track.steps.map((step) =>
    transformCompositionStep(step, {
      ...(options.at !== undefined
        ? {
            at: options.at
          }
        : {}),
      ...(options.defaults !== undefined
        ? {
            defaults: options.defaults
          }
        : {})
    })
  );

  return {
    ...track,
    target,
    steps
  };
}

type TransformCompositionStepOptions = {
  readonly at?: RegisteredMotionCompositionItem['at'];
  readonly defaults?: MotionTimelineDefaults;
};

function transformCompositionStep(
  step: MotionStepDefinition,
  options: TransformCompositionStepOptions
): MotionStepDefinition {
  const stepWithDefaults =
    options.defaults !== undefined ? applyMotionStepDefaults(step, options.defaults) : step;

  if (options.at === undefined) {
    return stepWithDefaults;
  }

  return {
    ...stepWithDefaults,
    at: shiftCompositionStepPosition(stepWithDefaults.at, options.at)
  };
}

function shiftCompositionStepPosition(
  stepPosition: MotionStepPosition | undefined,
  itemPosition: MotionStepPosition
): MotionStepPosition {
  if (stepPosition === undefined) {
    return itemPosition;
  }

  if (typeof itemPosition === 'number') {
    return shiftPositionByNumber(stepPosition, itemPosition);
  }

  if (typeof itemPosition === 'string') {
    return shiftPositionByLabel(stepPosition, itemPosition, 0);
  }

  if ('label' in itemPosition) {
    return shiftPositionByLabel(stepPosition, itemPosition.label, itemPosition.offset ?? 0);
  }

  return shiftPositionByAnchor(stepPosition, itemPosition.anchor, itemPosition.offset ?? 0);
}

function shiftPositionByNumber(
  stepPosition: MotionStepPosition,
  offset: number
): MotionStepPosition {
  if (typeof stepPosition === 'number') {
    return stepPosition + offset;
  }

  if (typeof stepPosition === 'string') {
    return {
      label: stepPosition,
      offset
    };
  }

  if ('label' in stepPosition) {
    return {
      label: stepPosition.label,
      offset: (stepPosition.offset ?? 0) + offset
    };
  }

  return {
    anchor: stepPosition.anchor,
    offset: (stepPosition.offset ?? 0) + offset
  };
}

function shiftPositionByLabel(
  stepPosition: MotionStepPosition,
  label: string,
  offset: number
): MotionStepPosition {
  if (typeof stepPosition === 'number') {
    return {
      label,
      offset: stepPosition + offset
    };
  }

  if (typeof stepPosition === 'string') {
    return {
      label: stepPosition,
      offset
    };
  }

  if ('label' in stepPosition) {
    return {
      label: stepPosition.label,
      offset: (stepPosition.offset ?? 0) + offset
    };
  }

  return shiftAnchorPositionWithBaseLabel(stepPosition, label, offset);
}

function shiftAnchorPositionWithBaseLabel(
  stepPosition: MotionAnchorStepPosition,
  label: string,
  offset: number
): MotionStepPosition {
  if (stepPosition.anchor === 'track-start') {
    return {
      label,
      offset: offset + (stepPosition.offset ?? 0)
    };
  }

  return {
    anchor: stepPosition.anchor,
    offset: (stepPosition.offset ?? 0) + offset
  };
}

function shiftPositionByAnchor(
  stepPosition: MotionStepPosition,
  anchor: MotionAnchorStepPosition['anchor'],
  offset: number
): MotionStepPosition {
  if (typeof stepPosition === 'number') {
    return {
      anchor,
      offset: stepPosition + offset
    };
  }

  if (typeof stepPosition === 'string') {
    return {
      label: stepPosition,
      offset
    };
  }

  if ('label' in stepPosition) {
    return shiftLabelPositionByAnchor(stepPosition, anchor, offset);
  }

  return {
    anchor: stepPosition.anchor,
    offset: (stepPosition.offset ?? 0) + offset
  };
}

function shiftLabelPositionByAnchor(
  stepPosition: MotionLabelStepPosition,
  anchor: MotionAnchorStepPosition['anchor'],
  offset: number
): MotionStepPosition {
  if (anchor === 'track-start') {
    return {
      label: stepPosition.label,
      offset: (stepPosition.offset ?? 0) + offset
    };
  }

  return {
    anchor,
    offset: (stepPosition.offset ?? 0) + offset
  };
}

function assertNever(value: never): never {
  throw new MotionPlanningError(
    `Unsupported motion composition item kind: ${String(value)}.`,
    'composition-item-unsupported-kind'
  );
}
