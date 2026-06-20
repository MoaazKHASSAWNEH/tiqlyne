export type MotionTriggerType =
  | 'onEnter'
  | 'onLeave'
  | 'onClick'
  | 'onHover'
  | 'onFocus'
  | 'onBlur'
  | 'onStateChange'
  | 'manual';

export const motionTriggerTypes = [
  'onEnter',
  'onLeave',
  'onClick',
  'onHover',
  'onFocus',
  'onBlur',
  'onStateChange',
  'manual'
] as const;

export function isMotionTriggerType(value: unknown): value is MotionTriggerType {
  return typeof value === 'string' && motionTriggerTypes.includes(value as MotionTriggerType);
}
