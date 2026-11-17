# Releases

Independent SemVer for **backend**, **web**, and **mobile** via [Changesets](https://github.com/changesets/changesets).

## Day-to-day (PR)

```bash
npm run changeset
```

Pick only the app(s) that changed (`@netrotrack/backend`, `web`, `@netrotrack/mobile`) and a bump type.

`@netrotrack/shared` is ignored unless you remove it from `.changeset/config.json` `ignore` for a public-contract release.

## Cut a release

```bash
npm run version-packages          # bumps package.json + CHANGELOG.md
# if mobile version changed:
npm run sync:mobile-version       # must exit 0 (strict Android/iOS asserts)
```

1. If **web** bumped: set `WEB_VERSION` in `apps/web/src/app/core/app-version.ts` to match `apps/web/package.json`.
2. Update [`feature-version-matrix.md`](./feature-version-matrix.md) for features this release completes or partially lands.
2. Commit: `chore(release): …`
3. Tag only the apps that bumped:

```bash
git tag -a backend-v1.2.0 -m "backend 1.2.0"
git tag -a web-v1.2.0 -m "web 1.2.0"
git tag -a mobile-v1.2.0 -m "mobile 1.2.0"
```

4. Deploy backend/web; build and submit mobile (see [`../ops/release-checklist.md`](../ops/release-checklist.md)).
5. Optionally bump `MIN_APP_VERSION_ANDROID` / `MIN_APP_VERSION_IOS` when forcing an upgrade.

## Related

- Design: `docs/superpowers/specs/2026-11-17-version-releases-design.md`
- Plan: `docs/superpowers/plans/2026-11-17-version-releases.md`
- Changesets: `.changeset/README.md`
