# GitHub Actions Workflows

This directory contains CI/CD workflows for automated building, testing, and deployment.

## Workflows

### 🚀 [`hugo.yml`](./hugo.yml) - Deploy to GitHub Pages

**Triggers:**

- Push to `redesign` branch
- Manual trigger via Actions tab

**What it does:**

1. Installs Hugo (extended v0.152.0) and Dart Sass
2. Checks out repository with submodules
3. Installs Node.js dependencies
4. Builds site with `--gc --minify`
5. Uploads to GitHub Pages
6. Deploys to production

**Requirements:**

- GitHub Pages enabled in repository settings
- Pages source set to "GitHub Actions"

### ✅ [`ci.yml`](./ci.yml) - Build and Test

**Triggers:**

- Pull requests to `redesign` or `master`
- Push to `redesign` branch

**What it does:**

1. **Build Test Job:**
   - Tests both development and production builds
   - Verifies build artifacts exist
   - Shows build statistics

2. **Markdown Lint Job:**
   - Lints all markdown files in `content/`
   - Continues on error (non-blocking)

3. **Link Check Job:**
   - Checks internal links in built HTML
   - Runs after successful build

### 📦 [`dependencies.yml`](./dependencies.yml) - Dependency Updates

**Triggers:**

- Weekly schedule (Monday 9:00 AM UTC)
- Manual trigger via Actions tab

**What it does:**

1. **Hugo Modules:** Updates and tidies Hugo modules
2. **NPM Dependencies:** Updates npm packages and runs audit fix

Both jobs create automated PRs for review.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under "Source", select **GitHub Actions**
3. Save

### 2. Verify Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", ensure:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### 3. Branch Protection (Optional but Recommended)

For the `redesign` branch:

1. Go to **Settings** → **Branches**
2. Add rule for `redesign`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select: `build-test`, `markdown-lint`

## Manual Workflow Triggers

You can manually trigger workflows:

1. Go to **Actions** tab
2. Select the workflow (Hugo, CI, or Dependencies)
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Monitoring

### View Workflow Runs

- **Actions** tab shows all workflow runs
- Click on any run to see detailed logs
- Failed runs will show error messages

### Notifications

You'll receive notifications for:

- Failed workflow runs
- New pull requests from dependency updates

### Build Status Badge

Add to README.md:

```markdown
![Deploy Status](https://github.com/SamyRai/samyrai.github.io/actions/workflows/hugo.yml/badge.svg)
```

## Troubleshooting

### Build Fails

1. Check Hugo version compatibility
2. Verify all dependencies in `package.json`
3. Test locally: `hugo --gc --minify`

### Deployment Fails

1. Verify GitHub Pages is enabled
2. Check workflow permissions
3. Ensure `CNAME` file exists (if using custom domain)

### Module Update PR Fails

1. Check for breaking changes in dependencies
2. Review module compatibility
3. Test locally before merging

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflows
act -l                    # List workflows
act push                  # Simulate push event
act pull_request          # Simulate PR event
```

## Workflow Costs

All workflows use GitHub-hosted runners:

- **Free tier:** 2,000 minutes/month for public repos
- Each workflow run typically takes 2-5 minutes
- Monitor usage in **Settings** → **Billing**

## Security

### Secrets Management

No secrets required for current setup. If needed:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets
3. Reference in workflows: `${{ secrets.SECRET_NAME }}`

### Dependabot (Already Configured)

Your `renovate.json` handles dependency updates. The workflow provides additional automation.

## Updates

Workflows are versioned with the repository. Update Hugo version in all workflows when upgrading:

```yaml
env:
  HUGO_VERSION: 0.152.0  # Update this
```

---

*Last updated: November 2025*
