export class MotionEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MotionEngineError';
  }
}