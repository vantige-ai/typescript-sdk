# Changesets Setup Guide

This project uses [Changesets](https://github.com/changesets/changesets) for version management and automated publishing to NPM.

## How It Works

1. **Creating Changes**: When you make changes, create a changeset using `yarn changeset`
2. **Version Bumping**: When ready to release, changesets will automatically bump versions based on the changeset types
3. **Automated Publishing**: GitHub Actions will handle publishing to NPM when changes are merged to main

## Setup Instructions

### 1. NPM Token Setup

You need to set up an NPM token for automated publishing:

1. Go to [NPM Settings](https://www.npmjs.com/settings/tokens)
2. Create a new "Automation" token
3. Add it to your GitHub repository secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add a new secret named `NPM_TOKEN` with your NPM token value

### 2. GitHub Actions

The workflow (`.github/workflows/release.yml`) will:
- Run on pushes to `main` branch
- Check for changesets
- Create a release PR if changesets exist
- Automatically publish to NPM when the release PR is merged

## Usage

### Creating a Changeset

When you make changes that should be released:

```bash
yarn changeset
```

This will:
1. Ask you which packages changed
2. Ask for the type of change (patch, minor, major)
3. Ask for a description of the change
4. Create a changeset file in `.changeset/`

### Example Changeset Types

- **patch**: Bug fixes, small improvements (0.1.2 → 0.1.3)
- **minor**: New features, backwards compatible (0.1.2 → 0.2.0)
- **major**: Breaking changes (0.1.2 → 1.0.0)

### Release Process

1. **Create changesets** for your changes
2. **Commit and push** your changes to a feature branch
3. **Create a PR** to main
4. **Merge the PR** - this will trigger the GitHub Action
5. **Review the release PR** that gets created automatically
6. **Merge the release PR** - this will publish to NPM

### Manual Release (if needed)

If you need to manually trigger a release:

```bash
# Version packages (bumps version numbers)
yarn version-packages

# Publish to NPM
yarn release
```

## Changeset Files

Changeset files are stored in `.changeset/` and look like this:

```markdown
---
"@vantige-ai/typescript-sdk": patch
---

Add new query method for knowledge base search
```

## Configuration

The changeset configuration is in `.changeset/config.json`:

- `access: "public"` - Publishes to public NPM registry
- `baseBranch: "main"` - Uses main branch for releases
- `commit: false` - Doesn't auto-commit changes

## Troubleshooting

### NPM Token Issues
- Ensure your NPM token has "Automation" type
- Check that the token is added to GitHub secrets as `NPM_TOKEN`
- Verify the token has publish permissions for `@vantige-ai/typescript-sdk`

### Version Conflicts
- If you get version conflicts, check that your local changesets are up to date
- Run `yarn changeset status` to see pending changesets

### Publishing Issues
- Check GitHub Actions logs for detailed error messages
- Ensure your package.json version is correct
- Verify all tests pass before publishing

## Best Practices

1. **Always create changesets** for user-facing changes
2. **Use descriptive changeset messages** - they become your changelog
3. **Test thoroughly** before creating changesets
4. **Review release PRs** before merging
5. **Keep changesets small** - one logical change per changeset

## Changelog

Changesets automatically generates a `CHANGELOG.md` file with all your releases. This is updated automatically when you publish.
