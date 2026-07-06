---
sidebar_position: 2
---

# Motion registry

`MotionRegistry` maps stable motion type strings to reusable definitions.

## MotionRegistry

```ts
interface MotionRegistry {
  register<TOptions extends object>(definition: MotionDefinition<TOptions>): void;
  has(type: string): boolean;
  get(type: string): MotionDefinition<object> | undefined;
  getAll(): ReadonlyArray<MotionDefinition<object>>;
  getByCategory(category: MotionCategory): ReadonlyArray<MotionDefinition<object>>;
}
```

| Method                    | Result                          | Purpose                                       |
| ------------------------- | ------------------------------- | --------------------------------------------- |
| `register(definition)`    | `void`; may throw on duplicates | Add one definition.                           |
| `has(type)`               | `boolean`                       | Check whether a type exists.                  |
| `get(type)`               | Definition or `undefined`       | Retrieve metadata, schema, or implementation. |
| `getAll()`                | Readonly definition array       | List the current catalogue.                   |
| `getByCategory(category)` | Readonly filtered array         | List definitions in one category.             |

## DefaultMotionRegistry

`DefaultMotionRegistry` is the supplied in-memory implementation. It preserves registration order. Registering an existing type throws:

```text
Motion already registered: <type>
```

It does not replace definitions silently.

## Registry registration versus engine registration

```ts
registry.register(new RiseInMotion());
```

Use `registry.register` while assembling dependencies or inside a pack helper.

```ts
motion.register(new RiseInMotion());
motion.registerMany([new AnotherMotion()]);
```

Use `motion.register` or `motion.registerMany` after the engine exists. The engine methods return the engine for fluent use.

`MotionRegistry` does **not** have `registerMany`. That method belongs only to `MotionEngine`; registry-based helpers call `register` once per definition.

## Register the official basic pack

```ts
import { DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);
```

The pack registers exactly `fade-in`, `fade-out`, and `slide-in`.

## Register an application pack

```ts
import type { MotionRegistry } from '@tiqlyne/motion-core';
import { RiseInMotion } from './rise-in.motion';

export function registerAppMotions(registry: MotionRegistry): void {
  registry.register(new RiseInMotion());
}
```

Compose packs before engine creation:

```ts
import { createMotionEngine, DefaultMotionRegistry } from '@tiqlyne/motion-core';
import { registerBasicMotions } from '@tiqlyne/motion-pack-basic';
import { WebMotionDriver } from '@tiqlyne/motion-web';

const registry = new DefaultMotionRegistry();

registerBasicMotions(registry);
registerAppMotions(registry);

const motion = createMotionEngine<Element>({
  registry,
  driver: new WebMotionDriver()
});
```

## Query the registry

```ts
registry.has('rise-in');
registry.get('rise-in');
registry.getAll();
registry.getByCategory('entrance');
```

The engine exposes the same four query methods when callers should not retain the registry separately.

## Naming best practices

- Use stable lowercase kebab-case types such as `product-card-enter`.
- Namespace application definitions when collisions are plausible.
- Do not reuse a type for different behavior during one application lifetime.
- Let duplicate registration fail visibly.
- Keep user-facing labels separate from stable machine-facing types.

## Related pages

- [Create and use a custom motion end to end](../tutorials/custom-motion-end-to-end.md)
- [Custom motion definition guide](../guides/custom-motion-definition.md)
- [Registered motions guide](../guides/registered-motions.md)
- [MotionEngine reference](./motion-engine.md)
- [Basic pack reference](./basic-pack.md)
