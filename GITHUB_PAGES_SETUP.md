# GitHub Pages Setup

Follow these steps to enable GitHub Pages for the documentation site.

## Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/Michael-Nussbaumer/nuxt-directus-module

2. Click on **Settings** (top right of the repository page)

3. In the left sidebar, scroll down and click on **Pages**

4. Under **Build and deployment** section:
   - **Source**: Select **GitHub Actions** from the dropdown
   - That's it! No need to select a branch when using GitHub Actions

## Step 2: Commit and Push the Changes

The documentation site files and GitHub Actions workflow are already created. Just commit and push:

```bash
git add .
git commit -m "feat: add documentation site with GitHub Pages deployment"
git push origin main
```

## Step 3: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow called "Deploy Documentation" running
3. Wait for it to complete (usually takes 1-2 minutes)
4. Once it's green (✓), your documentation is live!

## Step 4: Access Your Documentation

Your documentation will be available at:

**https://michael-nussbaumer.github.io/nuxt-directus-module/**

## Verification Checklist

✅ GitHub Pages enabled in Settings → Pages  
✅ Source set to "GitHub Actions"  
✅ Workflow completed successfully (green checkmark in Actions tab)  
✅ Documentation site loads at the URL above

## Automatic Updates

From now on, every time you push changes to the `main` branch, the documentation will automatically rebuild and deploy. No manual intervention needed!

## Troubleshooting

### Workflow Not Running

If the workflow doesn't start automatically:
1. Check the Actions tab for any errors
2. Ensure the workflow file exists at `.github/workflows/deploy-docs.yml`
3. Try manually triggering it from the Actions tab

### 404 Error on Documentation Site

1. Wait a few minutes after the first deployment
2. Check that the `base` in `docs-site/.vitepress/config.ts` matches your repo name
3. Clear your browser cache

### Build Fails

1. Check the Actions tab for error logs
2. Ensure all dependencies in `docs-site/package.json` are correct
3. Try building locally first: `cd docs-site && pnpm install && pnpm build`

## Local Testing

Before pushing, you can test the documentation locally:

```bash
cd docs-site
pnpm install
pnpm run dev
```

Visit http://localhost:5173 to preview the documentation.

## Maintenance

### Updating Documentation

1. Edit markdown files in `/docs` folder
2. Commit and push
3. GitHub Actions will automatically rebuild and deploy

VitePress reads directly from the `/docs` folder - no copying needed!

### Updating Configuration

Edit `docs-site/.vitepress/config.ts` to:
- Change navigation structure
- Update theme colors
- Modify social links
- Adjust site metadata

## Need Help?

- [VitePress Documentation](https://vitepress.dev/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
