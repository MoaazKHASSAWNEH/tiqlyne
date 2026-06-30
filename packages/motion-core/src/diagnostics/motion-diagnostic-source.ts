export const MotionDiagnosticSources = {
  TimelineValidator: 'motion-timeline-validator',
  TimelineInspector: 'timeline-inspector',
  PromisePlaybackController: 'promise-motion-playback-controller',
  WebPlaybackController: 'web-motion-playback-controller',
  WebMotionDriver: 'web-motion-driver',
  CompositionCompiler: 'motion-composition-compiler',
  MotionOptionValidator: 'motion-option-validator'
} as const;

export type MotionDiagnosticSource =
  (typeof MotionDiagnosticSources)[keyof typeof MotionDiagnosticSources];
