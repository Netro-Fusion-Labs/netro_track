# Changesets

Independent SemVer for `@netrotrack/backend`, `web`, and `@netrotrack/mobile`.

## Add a changeset (in a PR)

```bash
npm run changeset
```

Select only the app(s) that changed, then `patch` / `minor` / `major`.

The root meta package is not a workspace package Changesets tracks. `@netrotrack/shared` is in `ignore` by default — remove it from `.changeset/config.json` `ignore` only when its public contract changes.

## Version + changelog

```bash
npm run version-packages
```

If mobile bumped:

```bash
npm run sync:mobile-version
```

Then update `docs/releases/feature-version-matrix.md`, commit, and tag:

- `backend-vX.Y.Z`
- `web-vX.Y.Z`
- `mobile-vX.Y.Z`

See `docs/releases/README.md`.
