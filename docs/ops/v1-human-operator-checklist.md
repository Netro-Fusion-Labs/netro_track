# V1 Human Operator Checklist

Code for V1 role-parity completion is in the repo. These steps require secrets, cloud accounts, or physical devices and must be done by an operator.

## Backend / infrastructure

1. Set `REDIS_URL` on each API host (BullMQ workers soft-disable without it).
2. Set Firebase Admin env:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (escape newlines as `\n` in `.env`)
3. Confirm Cloudflare R2 credentials (`R2_*`) for image uploads.
4. Run Prisma migrate (includes `Device.fcm_token` / device registration fields):
   ```bash
   cd apps/backend && npx prisma migrate deploy
   ```
5. Re-seed capabilities if the environment was seeded from an older truncated tree:
   ```bash
   cd apps/backend && npx ts-node prisma/seed-capabilities.ts
   ```

## Mobile push (native configs — do not commit secrets)

1. Download `google-services.json` from Firebase Console → place at `apps/mobile/android/app/google-services.json`.
   - Gradle applies `com.google.gms.google-services` only when this file exists.
2. Download `GoogleService-Info.plist` → place at `apps/mobile/ios/mobile/GoogleService-Info.plist` (or the target’s resource folder) and add it to the Xcode target.
3. Rebuild native apps after adding those files (`pod install` on iOS).

## Stores / signing / soak

1. Configure Android release keystore properties (`NETROTRACK_RELEASE_*`).
2. Configure Apple Developer signing / App Store Connect.
3. Device soak: punch, offline queue, push open, biometric unlock, report CSV/PDF from web.

## Soft-fail behaviour (expected without operator setup)

| Missing | Behaviour |
|---------|-----------|
| `REDIS_URL` | API boots; jobs/workers skipped |
| Firebase Admin env | Push send skipped; no crash |
| `google-services.json` / plist | App builds; push init no-ops |
| R2 | Image upload endpoints fail until configured |
