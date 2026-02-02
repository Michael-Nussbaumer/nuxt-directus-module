# Documentation Hosting Setup Guide

This guide explains how to set up and deploy the documentation site to GitHub Pages.

## Prerequisites

- GitHub repository with Pages enabled
- pnpm installed locally (optional, for local development)

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. First Deployment

The documentation will automatically deploy when you push to the `main` branch. The GitHub Actions workflow is already configured in `.github/workflows/deploy-docs.yml`.

### 3. Access Your Documentation

After the first successful deployment, your documentation will be available at:

```
https://michael-nussbaumer.github.io/nuxt-directus-module/
```

## Local Development

To develop the documentation locally:

1. Install dependencies:
```bash
cd docs-site
pnpm install
```

2. Start development server:
```bash
pnpm run dev
```

3. Visit http://localhost:5173 in your browser

## Updating Documentation

Simply edit the markdown files in the `/docs` folder. VitePress is configured to read directly from this folder, so no syncing is needed.

```bash
# Edit any file in /docs
vim docs/getting-started.md

# Changes are automatically picked up
```

## Configuration

The documentation is configured in `docs-site/.vitepress/config.ts`. Key settings:

- **base**: `/nuxt-directus-module/` - Repository name for GitHub Pages
- **title**: Site title
- **themeConfig**: Navigation, sidebar, social links

## Customization

### Update Logo

Replace `docs-site/public/logo.svg` with your own logo.

### Change Theme Colors

VitePress uses GitHub's theme by default. To customize, edit the theme configuration in `.vitepress/config.ts`.

### Modify Navigation

Edit the `nav` and `sidebar` sections in `.vitepress/config.ts`.

## Troubleshooting

### Build Fails

Check the GitHub Actions logs:
1. Go to **Actions** tab in your repository
2. Click on the failed workflow
3. Review the error messages

### 404 on GitHub Pages

Ensure the `base` setting in `.vitepress/config.ts` matches your repository name:

```typescript
base: '/your-repo-name/'
```

### Search Not Working

The local search is built during the build process. Make sure:
1. The build completes successfully
2. You're viewing the production build (not dev mode)

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
