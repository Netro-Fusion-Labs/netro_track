# Version Releases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add independent SemVer releases for backend, web, and mobile via Changesets, with changelogs, tags, a feature matrix, mobile native sync (strict assertions), and version display surfaces.

**Architecture:** Monorepo Changesets tracks three apps independently; ignore root + shared by default. Release bumps update `CHANGELOG.md` per app. Mobile marketing/build numbers sync from `apps/mobile/package.json` via a Node script that fails closed. Feature compatibility lives in a curated matrix doc.

**Tech Stack:** `@changesets/cli`; Node script for Gradle/Xcode sync; Angular web About; RN Profile About; Express `/health`.

## Global Constraints

- Independent SemVer: web / mobile / backend (no shared product tag)
- Tags: `backend-v*`, `web-v*`, `mobile-v*` only
- `.changeset/config.json` must `ignore` root meta package `netrotrack` and `@netrotrack/shared`
- Mobile sync script must exit non-zero if Android/iOS files do not match intended values after write
- Do not invent Firebase/store secrets
- Commit as Boston Tech India `<dynamic92@gmail.com>`; no Co-Authored-By
- Spec: `docs/superpowers/specs/2026-11-17-version-releases-design.md`

## File map

| File | Responsibility |
|------|----------------|
| `.changeset/config.json` | Changesets ignore list + base branch |
| `.changeset/README.md` | How to add a changeset (short) |
| `apps/*/CHANGELOG.md` | Per-app history (Changesets-owned) |
| `scripts/sync-mobile-native-version.mjs` | Sync + assert native versions |
| `scripts/__tests__/sync-mobile-native-version.test.mjs` (optional) or Node assert self-test | Guard against silent miss |
| `docs/releases/feature-version-matrix.md` | Curated feature ↔ version table |
| `docs/releases/README.md` | Release workflow |
| `docs/ops/release-checklist.md` | Operator checklist |
| `apps/backend/src/app.ts` | Health includes package version |
| Web settings / shell | Show web version |
| Mobile ProfileScreen | Show app version + build |
| Root `package.json` | `changeset` / `sync:mobile-version` scripts |

---

### Task 1: Changesets scaffolding

**Files:**
- Create: `.changeset/config.json`
- Create: `.changeset/README.md`
- Create: `apps/backend/CHANGELOG.md`, `apps/web/CHANGELOG.md`, `apps/mobile/CHANGELOG.md` (empty/stub headers OK until first version)
- Modify: root `package.json` (devDependency `@changesets/cli`, scripts)
- Modify: `package-lock.json` via npm install

**Interfaces:**
- Produces: `npx changeset` prompts only backend / web / mobile

- [ ] **Step 1:** Install `@changesets/cli` as a root devDependency (`npm install -D @changesets/cli -w` or root install without `-w` per monorepo practice).

- [ ] **Step 2:** Create `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["netrotrack", "@netrotrack/shared"]
}
```

Verify package **names** match `package.json` `"name"` fields exactly (`netrotrack`, `@netrotrack/shared`, `@netrotrack/backend`, `web`, `@netrotrack/mobile`).

- [ ] **Step 3:** Add root scripts: `"changeset": "changeset"`, `"version-packages": "changeset version"`.

- [ ] **Step 4:** Add stub CHANGELOG headers under each app (`# Changelog` + note that Changesets owns subsequent entries).

- [ ] **Step 5:** Run `npx changeset status` (or dry interactive check) and confirm ignored packages do not appear as release targets.

- [ ] **Step 6:** Commit: `chore(release): add Changesets for independent app versions`

---

### Task 2: Mobile native version sync script (TDD)

**Files:**
- Create: `scripts/sync-mobile-native-version.mjs`
- Create: `scripts/__tests__/sync-mobile-native-version.test.mjs` (or colocate; use Node test runner / Jest if already available at root — prefer small Node assert script runnable via `node --test`)
- Modify: root `package.json` script `sync:mobile-version`
- Modify (at runtime only when releasing): `apps/mobile/android/app/build.gradle`, `apps/mobile/ios/mobile.xcodeproj/project.pbxproj`

**Interfaces:**
- Consumes: `apps/mobile/package.json` → `version`
- Produces: matching Android `versionName` / `versionCode`, iOS `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`
- Env: optional `MOBILE_VERSION_CODE` to set build integer explicitly; otherwise increment max of current Android/iOS build ints by 1

- [ ] **Step 1:** Write a failing test that copies fixture gradle/pbxproj snippets (or uses temp dirs), runs sync logic, and expects exit 0 + matched values; a second case where write is mocked incomplete expects non-zero (or unit-test the assert helpers).

- [ ] **Step 2:** Implement `scripts/sync-mobile-native-version.mjs`:
  - Read mobile package version
  - Regex-replace `versionName "..."` and `versionCode <n>` in `apps/mobile/android/app/build.gradle`
  - Regex-replace all `MARKETING_VERSION = …` and `CURRENT_PROJECT_VERSION = …` in the pbxproj (Debug + Release)
  - Re-read files and assert equality; `process.exit(1)` on failure with stderr message naming the field

- [ ] **Step 3:** Run tests; fix until green.

- [ ] **Step 4:** Dry-run against the real repo (or temp copy): after sync, re-run assertions path must pass.

- [ ] **Step 5:** Commit: `feat(mobile): add native version sync script with strict asserts`

---

### Task 3: Release docs + feature matrix

**Files:**
- Create: `docs/releases/README.md`
- Create: `docs/releases/feature-version-matrix.md`
- Create: `docs/ops/release-checklist.md`
- Modify: `docs/README.md` (link to releases)
- Modify: `docs/security/environment-variables.md` (cross-link min app version to release checklist)

**Interfaces:**
- Produces: curated matrix columns exactly as spec §6

- [ ] **Step 1:** Seed `feature-version-matrix.md` with known V1 features (attendance, visits, sales, inspections, reports CSV/PDF, FCM, biometric, jobs) and honest Status (`shipped` / `partial`) + backend/web/mobile version placeholders (`TBD` or `>=1.0.0` once baseline set).

- [ ] **Step 2:** Write `docs/releases/README.md` covering: add changeset → PR → `version-packages` → `sync:mobile-version` if mobile → update matrix → commit → tag `backend-v*` / `web-v*` / `mobile-v*`.

- [ ] **Step 3:** Write `docs/ops/release-checklist.md` including deploy, store submit, `MIN_APP_VERSION_*` bump, Firebase/R2 reminders (link human checklist).

- [ ] **Step 4:** Link from `docs/README.md`.

- [ ] **Step 5:** Commit: `docs(release): add feature matrix and release workflow`

---

### Task 4: Expose versions in backend / web / mobile UI

**Files:**
- Modify: `apps/backend/src/app.ts` (`/health` includes `version` from package.json)
- Modify: `apps/web` settings (or shell footer) — prefer Settings “About” row
- Modify: `apps/mobile/src/features/profile/screens/ProfileScreen.tsx` — About line with version + build
- Possibly Create: small helpers `getAppVersion()` reading package.json / native constants

**Interfaces:**
- Backend health JSON includes `data.version` or top-level `version` (match existing envelope style if health is non-envelope today — keep success shape consistent with current `/health` or migrate carefully)
- Web shows SemVer string from `apps/web/package.json` (Angular: prefer `environment` or `import packageJson from '../../../../../package.json'` with resolveJsonModule, or inject at build time)
- Mobile: use `react-native` DeviceInfo **only if already approved in stack** — otherwise read from a tiny generated/constants file written by sync script, or hardcode import of package.json version + native build via a constant module updated by sync script. **Do not add a new library without approval.** Prefer: sync script also writes `apps/mobile/src/shared/constants/appVersion.ts` with `{ version, build }` so JS can import without new deps.

- [ ] **Step 1:** Extend sync script (Task 2) to also write `apps/mobile/src/shared/constants/appVersion.ts` and assert file contents.

- [ ] **Step 2:** Backend `/health` returns package version (read via `require('../package.json').version` or import).

- [ ] **Step 3:** Web Settings About shows `Web x.y.z`.

- [ ] **Step 4:** Mobile Profile shows `App x.y.z (build N)` from `appVersion.ts`.

- [ ] **Step 5:** Typecheck affected apps.

- [ ] **Step 6:** Commit: `feat: surface app versions in health, web settings, and mobile profile`

---

### Task 5: Mobile min-version force-upgrade (env already documented)

**Files:**
- Create or Modify: backend app-config / auth bootstrap endpoint returning `minAppVersionAndroid`, `minAppVersionIos` from env
- Create: mobile blocking update screen + check on app start / post-login
- Modify: `docs/ops/release-checklist.md` (when to bump `MIN_APP_VERSION_*`)

**Note:** Grep shows no existing `MIN_APP_VERSION` consumer in `apps/` — this task implements the path designed in the spec.

- [ ] **Step 1:** Expose min versions from backend (dedicated lightweight route or extend an existing bootstrap payload). Do not invent store URLs; optional env `ANDROID_STORE_URL` / `IOS_STORE_URL` later.

- [ ] **Step 2:** Mobile: compare marketing SemVer from `appVersion.ts` to server min; if below, show non-dismissible Update required UI (MPIN/main app gated).

- [ ] **Step 3:** Unit-test SemVer compare helper (edge: equal, below, above).

- [ ] **Step 4:** Commit: `feat(mobile): enforce minimum app version from backend config`

---

### Task 6: Baseline versions + smoke release dry-run

**Files:**
- Modify: `apps/backend/package.json`, `apps/web/package.json`, `apps/mobile/package.json` versions as agreed (document choice in matrix intro: e.g. set all to `1.0.0-rc.0` or keep current and note “pre-formal”)
- Possibly create empty `.changeset/*.md` only if doing a real first bump — for dry-run, document commands without necessarily publishing tags

- [ ] **Step 1:** Align version strings intentionally (recommend leave as-is until first real release OR set mobile package.json to match Android `1.1` for consistency). Record choice in matrix intro.

- [ ] **Step 2:** Run `npm run sync:mobile-version` once if aligning mobile; confirm exit 0.

- [ ] **Step 3:** Document example tag commands in release README (do not push tags unless user asks).

- [ ] **Step 4:** Final verification: Changesets ignore list; sync script assertions; docs links; tsc for touched apps.

- [ ] **Step 5:** Commit: `chore(release): baseline version release tooling`

---

## Verification checklist (plan complete when)

> Tasks renumbered: force-upgrade is Task 5; baseline dry-run is Task 6.

- [ ] `npx changeset` only offers backend, web, mobile
- [ ] Sync script fails if gradle/pbxproj intentionally broken in a test
- [ ] Matrix + release docs exist and match spec columns
- [ ] Health / web / mobile show versions
- [ ] Spec DoD items checked off in the design doc after implementation
