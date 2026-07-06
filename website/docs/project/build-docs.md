---
sidebar_position: 5
---

# Build the documentation

Run the development server:

```bash
pnpm --filter website start
```

Create a production build:

```bash
pnpm --filter website clear
pnpm --filter website build
```

Docusaurus treats broken links as build errors. Before submitting documentation changes, also run:

```bash
pnpm format
pnpm typecheck
```

The production base path is `/motion-engine/` for GitHub Pages. Use Docusaurus links instead of hard-coding deployment hosts.
