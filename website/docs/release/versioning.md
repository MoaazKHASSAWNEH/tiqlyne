---
sidebar_position: 6
---

# Versioning

The three official packages currently share version `0.1.0`:

- `@tiqlyne/motion-core`
- `@tiqlyne/motion-web`
- `@tiqlyne/motion-pack-basic`

Core is the dependency foundation. Web and the basic pack depend on core, so releases are built and published in that order. Aligned versions make the tested package set easy to identify.

The intended policy is semantic versioning. Before 1.0, a minor version may contain breaking public API changes; patch versions should remain focused on compatible fixes. After 1.0, breaking public API changes should require a major version.

## Related pages

- [API stability](./api-stability.md)
- [npm publication](./npm-publication.md)
- [Release status](./status.md)
