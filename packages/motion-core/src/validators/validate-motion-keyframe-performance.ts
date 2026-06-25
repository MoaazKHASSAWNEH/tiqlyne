import { createMotionValidationLevelDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic, MotionDiagnosticLevel } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';
import type {
  MotionPerformanceDiagnosticLevel,
  MotionPerformanceDiagnosticsOptions
} from '../models/motion-validation-options';
import { getMotionKeyframePropertyPerformanceTier } from '../models/motion-performance-tier';

const DEFAULT_PERFORMANCE_DIAGNOSTICS_OPTIONS = {
  filter: 'warning',
  shadow: 'warning',
  paint: 'warning'
} as const satisfies Required<MotionPerformanceDiagnosticsOptions>;

type KeyframePerformanceCategory = keyof MotionPerformanceDiagnosticsOptions;

function resolvePerformanceDiagnosticLevel(
  category: KeyframePerformanceCategory,
  options: MotionPerformanceDiagnosticsOptions | undefined
): MotionPerformanceDiagnosticLevel {
  return options?.[category] ?? DEFAULT_PERFORMANCE_DIAGNOSTICS_OPTIONS[category];
}

function pushPerformanceDiagnostic(
  diagnostics: MotionDiagnostic[],
  category: KeyframePerformanceCategory,
  options: MotionPerformanceDiagnosticsOptions | undefined,
  code: string,
  message: string,
  metadata: KeyframePerformanceMetadata & {
    readonly property: string;
  }
): void {
  const level = resolvePerformanceDiagnosticLevel(category, options);

  if (level === 'off') {
    return;
  }

  diagnostics.push(
    createMotionValidationLevelDiagnostic(level satisfies MotionDiagnosticLevel, code, message, {
      ...metadata,
      performanceTier: getMotionKeyframePropertyPerformanceTier(metadata.property)
    })
  );
}

type KeyframePerformanceMetadata = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly keyframeIndex: number;
};

export function validateKeyframePerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata,
  options?: MotionPerformanceDiagnosticsOptions
): void {
  validateFilterPerformance(keyframe, diagnostics, metadata, options);
  validateShadowPerformance(keyframe, diagnostics, metadata, options);
  validatePaintPropertyPerformance(keyframe, diagnostics, metadata, options);
}
function validateFilterPerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata,
  options: MotionPerformanceDiagnosticsOptions | undefined
): void {
  if (keyframe.filter === undefined) {
    return;
  }

  pushPerformanceDiagnostic(
    diagnostics,
    'filter',
    options,
    'timeline-performance-filter',
    'Animating filter can be expensive. Prefer transform and opacity when possible.',
    {
      ...metadata,
      property: 'filter'
    }
  );
}

function validateShadowPerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata,
  options: MotionPerformanceDiagnosticsOptions | undefined
): void {
  if (keyframe.boxShadow === undefined) {
    return;
  }

  pushPerformanceDiagnostic(
    diagnostics,
    'shadow',
    options,
    'timeline-performance-shadow',
    'Animating boxShadow can trigger expensive paint work.',
    {
      ...metadata,
      property: 'boxShadow'
    }
  );
}

function validatePaintPropertyPerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata,
  options: MotionPerformanceDiagnosticsOptions | undefined
): void {
  const paintProperties = [
    'backgroundColor',
    'color',
    'borderColor',
    'outlineColor'
  ] as const satisfies ReadonlyArray<keyof MotionKeyframe>;

  for (const property of paintProperties) {
    if (keyframe[property] === undefined) {
      continue;
    }

    pushPerformanceDiagnostic(
      diagnostics,
      'paint',
      options,
      'timeline-performance-paint-property',
      'Animating color properties can trigger paint work.',
      {
        ...metadata,
        property
      }
    );
  }
}
