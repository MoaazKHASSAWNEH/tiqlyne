---
sidebar_position: 5
---

# API stability

Version 0.1.0 is pre-1.0. Public APIs are documented and tested, but may evolve between minor releases while the project establishes long-term contracts.

Prefer high-level surfaces—`createMotionEngine`, timeline/composition builders, `MotionDefinition`, `MotionDriver`, and package registration—for application code. Planner, scheduler, preparation, conversion, and validation helpers are public for advanced tooling but are more likely to evolve.

Pin exact versions when reproducibility matters, read release notes before upgrading, and keep custom drivers/definitions covered by typechecks and tests. No compatibility guarantee is made for undocumented internals or direct source-file imports.

## Related pages

- [Versioning](./versioning.md)
- [Version 0.1.0](./v0-1-0.md)
- [Limitations](./limitations.md)
