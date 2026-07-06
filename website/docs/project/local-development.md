---
sidebar_position: 2
---

# Local development

These commands are for contributors working on the monorepo.

```bash
git clone https://github.com/MoaazKHASSAWNEH/motion-engine.git
cd motion-engine
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm format
```

Run the documentation locally:

```bash
pnpm --filter website start
```

Run the internal browser demo:

```bash
pnpm --filter @tiqlyne/motion-example-vanilla dev
```

Do not copy workspace dependency ranges or repository-only commands into consumer applications. Application installation is documented under [Installation](../start/installation.md).
