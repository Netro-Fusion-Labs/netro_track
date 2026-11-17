# Release Checklist

Use after `npm run version-packages` (and `npm run sync:mobile-version` if mobile bumped).

## All apps

- [ ] CHANGELOG entries look correct for the apps that bumped
- [ ] `docs/releases/feature-version-matrix.md` updated
- [ ] Annotated tags created: `backend-v*`, `web-v*`, and/or `mobile-v*` as applicable
- [ ] Tags pushed only when intentionally publishing (`git push origin <tag>`)

## Backend

- [ ] Deploy API build matching `backend-v*`
- [ ] Prisma migrate deploy if migrations included
- [ ] Confirm `/health` reports expected `version`
- [ ] Redis / Firebase Admin / R2 configured as needed ([v1-human-operator-checklist](./v1-human-operator-checklist.md))

## Web

- [ ] Deploy Angular build matching `web-v*`
- [ ] Smoke: login, Settings → About shows version

## Mobile

- [ ] `npm run sync:mobile-version` exited 0
- [ ] Android `versionName` / `versionCode` and iOS `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` match package SemVer / build
- [ ] Profile shows `App x.y.z (build N)`
- [ ] Store signing + upload (Play / TestFlight)
- [ ] Native Firebase files present for push builds

## Force upgrade (optional)

When an old mobile build must stop working:

- [ ] Set `MIN_APP_VERSION_ANDROID` and/or `MIN_APP_VERSION_IOS` on the API host to the minimum marketing SemVer
- [ ] Confirm blocking Update screen on an older build
- [ ] Record the bump in the feature matrix notes
