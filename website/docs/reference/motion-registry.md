---
sidebar_position: 2
---

# Motion registry

The registry maps stable motion type strings to reusable `MotionDefinition` instances.

```ts
interface MotionRegistry {
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): void;
  has(type: string): boolean;
  get(type: string): MotionDefinition<object> | undefined;
  getAll(): ReadonlyArray<MotionDefinition<object>>;
  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>;
}
```

## DefaultMotionRegistry

`DefaultMotionRegistry` is an in-memory implementation that preserves registration order. Registering a type twice throws `Error: Motion already registered: <type>`.

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const registry = new DefaultMotionRegistry();
registerBasicMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});
```

| Method                    | Result                           | When to use                                   |
| ------------------------- | -------------------------------- | --------------------------------------------- |
| `register(definition)`    | `void`; throws on duplicate type | Add one definition or a pack implementation.  |
| `has(type)`               | `boolean`                        | Guard optional motion configuration.          |
| `get(type)`               | Definition or `undefined`        | Inspect schema/metadata or compile a motion.  |
| `getAll()`                | Readonly snapshot                | Build catalogues and tooling.                 |
| `getByCategory(category)` | Filtered readonly snapshot       | Group definitions by `entrance`, `exit`, etc. |

`MotionRegistry` does **not** expose `registerMany`. Use `motion.registerMany(definitions)` on `MotionEngine`, or call `registry.register` in a loop. `registerBasicMotions(registry)` registers `fade-in`, `fade-out`, and `slide-in`.

Prefer lowercase kebab-case type names (`product-card-enter`) and namespace application-specific definitions when collisions are possible. Do not silently replace a registered type.

## Related pages

- [Registered motions guide](../guides/registered-motions.md)
- [Motion definitions](./motion-definition.md)
- [Basic pack](./basic-pack.md)
