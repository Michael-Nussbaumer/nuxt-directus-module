# Documentation Site

This directory contains the VitePress documentation site for `@michael-nussbaumer/nuxt-directus`.

## Development

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm run dev
```

## Build

Build the documentation:

```bash
pnpm run build
```

Preview the build:

```bash
pnpm run preview
```

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

Visit the documentation at: https://michael-nussbaumer.github.io/nuxt-directus-module/

## Structure

- `.vitepress/config.ts` - VitePress configuration (configured to read from `/docs`)
- `public/` - Static assets (logo, etc.)
- All documentation pages are read directly from `/docs` folder (no duplication)
