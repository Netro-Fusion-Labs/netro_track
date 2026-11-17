# Version Releases Design (Web, Mobile, Backend)

> **Status:** Approved 2026-11-17 (with implementation safeguards)  
> **Branch:** `feature/NT-v1-completion` (or dedicated `chore/version-releases` as preferred)  
> **Approach:** Changesets (Approach B) — independent SemVer per app + curated feature matrix

---

## 1. Goal

Maintain **version-wise feature releases** for NetroTrack with:

1. Independent SemVer for **web**, **mobile**, and **backend**
2. Per-app `CHANGELOG.md` files generated via Changesets
3. Package-scoped git tags
4. A curated **feature ↔ version matrix** for cross-app compatibility
5. A mobile native version sync script with **strict post-write assertions**

---

## 2. Decisions (locked)

| Decision | Choice |
|----------|--------|
| Why | Ship and track features by version |
| Web vs mobile | **Independent** SemVer lines |
| Backend | **Separate** SemVer (not tied to a single client) |
| Feature tracking | **Matrix + changelogs** |
| Tooling | **`@changesets/cli`** at monorepo root |

---

## 3. Version identity

| App | Source of truth | Display SemVer | Native build |
|-----|-----------------|----------------|--------------|
| Backend | `apps/backend/package.json` | `x.y.z` | n/a |
| Web | `apps/web/package.json` | `x.y.z` | n/a |
| Mobile | `apps/mobile/package.json` | `x.y.z` (= Android `versionName`, iOS `MARKETING_VERSION`) | Android `versionCode` / iOS `CURRENT_PROJECT_VERSION` — monotonic integers |

- Root `package.json` version is **meta only** (not a product release).
- `packages/shared` is **ignored** by Changesets interactive prompts unless its public contract changes (see §4). When shared does change, note it in consuming apps’ changelogs; no separate product tag line unless added later.
- First formal release under this system: align to a coherent start (recommend `1.0.0` at V1 ship gate; until then bump from current package/native values as needed).

---

## 4. Changesets configuration

### Packages in scope

Tracked for interactive release prompts:

- `@netrotrack/backend` → `apps/backend`
- `web` → `apps/web`
- `@netrotrack/mobile` → `apps/mobile`

### Safeguard 1 — explicit ignore

In `.changeset/config.json`, set `ignore` so `npx changeset` cleanly scopes prompts:

- Root workspace meta package name (`netrotrack` from root `package.json`)
- `@netrotrack/shared` (unless intentionally removed from ignore for a shared-contract release)

Also:

- `linked: []` (fully independent bumps)
- `access: "restricted"` (private packages)
- `baseBranch`: `main` (or `develop` if that is the integration default — match repo workflow; document in config comment / release docs)
- `changelog`: `@changesets/cli/changelog`
- `commit`: `false` (human/agent creates conventional commits)

### Tag names (exact)

| App | Tag pattern | Example |
|-----|-------------|---------|
| Backend | `backend-v{semver}` | `backend-v1.2.0` |
| Web | `web-v{semver}` | `web-v1.2.0` |
| Mobile | `mobile-v{semver}` | `mobile-v1.2.0` |

**Do not** use a single monorepo `v1.2.0` tag for product releases.

### Changelog paths

- `apps/backend/CHANGELOG.md`
- `apps/web/CHANGELOG.md`
- `apps/mobile/CHANGELOG.md`

---

## 5. Mobile native sync script

**File:** `scripts/sync-mobile-native-version.mjs`

**Behavior:**

1. Read SemVer from `apps/mobile/package.json`.
2. Update Android `apps/mobile/android/app/build.gradle`:
   - `versionName` → package SemVer string
   - `versionCode` → increment by 1 (or override via env e.g. `MOBILE_VERSION_CODE` for controlled hotfixes)
3. Update iOS `apps/mobile/ios/mobile.xcodeproj/project.pbxproj`:
   - `MARKETING_VERSION` → package SemVer (or major.minor if project currently stores shortened form — prefer full SemVer `x.y.z` for consistency)
   - `CURRENT_PROJECT_VERSION` → same integer strategy as Android `versionCode` (keep Android/iOS build integers in lockstep unless env overrides)

### Safeguard 2 — strict assertions

After writes, **re-read** the target files and assert:

- Android `versionName` equals `package.json` version
- Android `versionCode` equals the intended build integer
- iOS `MARKETING_VERSION` equals the intended marketing version string
- iOS `CURRENT_PROJECT_VERSION` equals the intended build integer

On any mismatch: print a clear error and **`process.exit(1)`**. No silent partial updates.

Wire as npm script, e.g. root `"sync:mobile-version": "node scripts/sync-mobile-native-version.mjs"`.

---

## 6. Feature ↔ version matrix

**File:** `docs/releases/feature-version-matrix.md`

| Column | Purpose |
|--------|---------|
| Feature / capability | Human name + optional capability slug |
| Status | `shipped` / `partial` / `planned` |
| Backend | First version or range (`>=1.2.0`) or `—` |
| Web | same |
| Mobile | same |
| Notes / blockers | e.g. nav Coming Soon, operator Firebase, etc. |

**Rules:**

- Matrix is **curated** (not auto-generated from commits).
- Update rows when a release completes or partially lands a feature.
- Product labels (V1 / V1.1) may appear in Notes; they do not replace app SemVer.
- Link to changelog sections when useful.

Also add short release docs:

- `docs/releases/README.md` — how to add a changeset, version, sync mobile, tag, update matrix
- `docs/ops/release-checklist.md` — operator steps including store submit / min-version bump

---

## 7. UI / ops version display

| Surface | Display |
|---------|---------|
| Web | Settings/About or shell footer: `Web x.y.z` from `package.json` (build-time inject or import) |
| Mobile | Profile/About: `App x.y.z (build N)` |
| Backend | `GET /health` → `version` from `apps/backend/package.json` |
| Support | Matrix + changelogs + git tags; device register already carries `appVersion` |

---

## 8. Min-version and API compatibility

### Mobile force-upgrade

- Env (already documented): `MIN_APP_VERSION_ANDROID`, `MIN_APP_VERSION_IOS` (marketing SemVer).
- Compare client marketing version on login/app-config; if below min → blocking update screen.
- Store URLs optional in config when available.

### API surface vs backend package SemVer

- HTTP remains `/api/v1` until a breaking contract → `/api/v2`.
- Backend package SemVer: **minor** = additive; **major** = breaking (usually with API v2).
- Cross-app “needs backend >= x.y.z” lives in the matrix; hard client enforcement of min backend is optional later.

### Web

- No store force-upgrade; deploy is immediate. Soft banners for stale caches are out of initial scope.

---

## 9. Release ritual

1. PRs include Changeset files naming which app(s) + bump type.
2. `npx changeset version` updates package versions + changelogs.
3. If mobile bumped → `npm run sync:mobile-version` (must exit 0).
4. Update `docs/releases/feature-version-matrix.md` for completed/partial features.
5. Commit release (`chore(release): …`), merge.
6. Create annotated tags: `backend-v*`, `web-v*`, `mobile-v*` as applicable.
7. Deploy backend/web; build/submit mobile.
8. If forcing upgrade: bump `MIN_APP_VERSION_*` in the target environment.

---

## 10. Out of scope

- Fastlane / automated store upload (may hook tags later)
- Auto-generating the feature matrix from git history
- Forcing identical SemVer across web/mobile/backend
- Root meta package or shared as product release lines (unless shared ignore is lifted for a contract release)

---

## 11. Implementation safeguards (explicit)

1. **Changesets `ignore`:** root meta package + `@netrotrack/shared` so interactive prompts only offer backend, web, mobile by default.
2. **Native sync assertions:** script exits non-zero if Android/iOS files do not match intended versionName/versionCode / MARKETING_VERSION / CURRENT_PROJECT_VERSION after update.

---

## 12. Definition of Done

- [ ] `.changeset/config.json` with ignore list and independent packages
- [ ] Initial CHANGELOG stubs + first changesets workflow documented
- [ ] `scripts/sync-mobile-native-version.mjs` with strict assertions + npm script
- [ ] `docs/releases/feature-version-matrix.md` seeded with current known features
- [ ] Release README + ops checklist
- [ ] Web/mobile About (or equivalent) shows version; backend `/health` exposes version
- [ ] Min-version env docs cross-linked; force-upgrade path designed (implement if not already present)
- [ ] Spec self-review complete; implementation plan written
