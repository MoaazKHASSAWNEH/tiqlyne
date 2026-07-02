/**
 * Framework-agnostic reference to a motion target.
 *
 * The core package stores target references only. The active driver decides how
 * to resolve them in a specific runtime such as DOM, canvas, native UI or tests.
 */
export type MotionTargetReference =
  | {
      /**
       * Targets the root element passed to the driver.
       */
      readonly type: 'self';
    }
  | {
      /**
       * Targets a named child of the root element.
       */
      readonly type: 'child';

      /**
       * Child target name.
       */
      readonly name: string;
    }
  | {
      /**
       * Targets an element using a runtime-specific selector.
       */
      readonly type: 'selector';

      /**
       * Selector string interpreted by the active driver.
       */
      readonly selector: string;
    }
  | {
      /**
       * Targets a named element known by the active driver.
       */
      readonly type: 'named';

      /**
       * Named target identifier.
       */
      readonly name: string;
    };
