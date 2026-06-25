import { createMotionValidationWarningDiagnostic as createWarningDiagnostic } from './create-motion-validation-diagnostic';
import type { MotionDiagnostic } from '../models/motion-diagnostic';
import type { MotionKeyframe } from '../models/motion-keyframe';

type KeyframePerformanceMetadata = {
  readonly trackIndex: number;
  readonly stepIndex: number;
  readonly keyframeIndex: number;
};

export function validateKeyframePerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata
): void {
  validateFilterPerformance(keyframe, diagnostics, metadata);
  validateShadowPerformance(keyframe, diagnostics, metadata);
  validatePaintPropertyPerformance(keyframe, diagnostics, metadata);
}

function validateFilterPerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata
): void {
  if (keyframe.filter === undefined) {
    return;
  }

  diagnostics.push(
    createWarningDiagnostic(
      'timeline-performance-filter',
      'Animating filter can be expensive. Prefer transform and opacity when possible.',
      {
        ...metadata,
        property: 'filter'
      }
    )
  );
}

function validateShadowPerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata
): void {
  if (keyframe.boxShadow === undefined) {
    return;
  }

  diagnostics.push(
    createWarningDiagnostic(
      'timeline-performance-shadow',
      'Animating boxShadow can trigger expensive paint work.',
      {
        ...metadata,
        property: 'boxShadow'
      }
    )
  );
}

function validatePaintPropertyPerformance(
  keyframe: MotionKeyframe,
  diagnostics: MotionDiagnostic[],
  metadata: KeyframePerformanceMetadata
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

    diagnostics.push(
      createWarningDiagnostic(
        'timeline-performance-paint-property',
        'Animating color properties can trigger paint work.',
        {
          ...metadata,
          property
        }
      )
    );
  }
}
