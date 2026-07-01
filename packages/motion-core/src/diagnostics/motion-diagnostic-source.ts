/**
 * Stable diagnostic sources emitted by the core and web packages.
 *
 * A source identifies the subsystem that produced a diagnostic. This is useful
 * for debugging, logging, filtering and UI tooling.
 */
export const MotionDiagnosticSources = {
  TimelineValidator: 'motion-timeline-validator',
  TimelineInspector: 'timeline-inspector',
  PromisePlaybackController: 'promise-motion-playback-controller',
  WebPlaybackController: 'web-motion-playback-controller',
  WebMotionDriver: 'web-motion-driver',
  CompositionCompiler: 'motion-composition-compiler',
  MotionOptionValidator: 'motion-option-validator'
} as const;

/**
 * Built-in diagnostic source value.
 *
 * Custom drivers and plugins may use their own source strings where needed.
 */
export type MotionDiagnosticSource =
  (typeof MotionDiagnosticSources)[keyof typeof MotionDiagnosticSources];
