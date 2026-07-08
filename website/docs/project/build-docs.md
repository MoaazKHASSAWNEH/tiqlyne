---
sidebar_position: 5
---

# Build the documentation

This page is for maintainers and contributors working on the official Docusaurus site.

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

The production base path is `/tiqlyne/` for GitHub Pages. Use Docusaurus links instead of hard-coding deployment hosts.
