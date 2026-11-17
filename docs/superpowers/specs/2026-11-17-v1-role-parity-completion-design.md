# V1 Role-Appropriate Parity Completion — Design Spec

> **Status:** Approved in principle (2026-11-17)  
> **Branch:** `feature/NT-v1-completion`  
> **Approach:** Finish-layer (Approach 1) — close V1 gaps on existing architecture  
> **Parity model:** Option A — role-appropriate (not UI clone)

---

## 1. Goal

Bring NetroTrack to production-ready **V1 completeness** with:

1. **100% backend** API and worker completeness for V1 scope.
2. **Web (Angular)** as the primary admin/manager surface.
3. **Mobile (React Native)** focused on field workflows plus existing mobile admin/manager screens — without cloning desktop-heavy admin tables onto phones.

After implementation, deliver an explicit checklist of items that still require human/ops action (Firebase native configs, store accounts, secrets, device soak tests).

---

## 2. Non-goals (explicitly out of V1)

- Task management, geofencing, leave, expenses, custom form builder
- Bulk CSV employee/customer import
- White-label, billing, AI insights, route optimization, open API
- Cloning Command Center / dense admin data grids onto mobile
- Guaranteeing push delivery without customer-provided Firebase project files
- App Store / Play Store submission (human accounts + signing)

---

## 3. Architecture principles

- Layered backend: Controller → Middleware → Service → Repository → Prisma.
- Multi-tenancy: every business query filters by `companyId` from JWT; never trust body/URL `companyId` for tenant data access (platform-admin overrides remain explicit and audited).
- Dynamic authorization: effective permissions = company entitlements ∩ access-group capabilities; enforce via existing `permission.middleware` + `PermissionService`.
- Jobs: BullMQ on Redis (`REDIS_URL`); soft-disable when Redis unset.
- Push: Firebase Admin on backend; `@react-native-firebase/messaging` on mobile; invalid tokens cleared.
- Reports: JSON for UI; CSV/PDF as export formats from the same service layer.
- Mobile auth: MPIN remains primary; biometric is optional unlock after successful MPIN setup/verify.
- Offline: MMKV queues + sync engine for field mutations; idempotent local UUIDs.

---

## 4. Backend design

### 4.1 Permission enforcement

**Current state:** `apps/backend/src/shared/middlewares/permission.middleware.ts` and `PermissionService` exist but are not applied consistently across business routers.

**Target:**

- Audit all routers under `apps/backend/src/modules/*/`.
- Apply permission middleware with capability slugs aligned to `seed-capabilities` / SystemCapability tree (attendance, visits, sales, inspections, reports, policies, access_control, etc.).
- Keep `role.middleware` for platform-only boundaries (`SUPER_ADMIN` / `MASTER_SUPER_ADMIN`).
- Field-employee self-scope remains enforced in services/controllers (own records only) in addition to capability checks.

### 4.2 Report exports

**Current state:** `GET /api/v1/reports/attendance|visits|sales` return JSON only. No inspections report. No CSV/PDF.

**Target API:**

| Method | Path | Query | Behavior |
|--------|------|-------|----------|
| GET | `/api/v1/reports/attendance` | `startDate`, `endDate`, `userId?`, `format=json\|csv\|pdf` | Existing JSON + CSV/PDF |
| GET | `/api/v1/reports/visits` | same | same |
| GET | `/api/v1/reports/sales` | same | same |
| GET | `/api/v1/reports/inspections` | same | **New** JSON + CSV/PDF |

**Rules:**

- `format=json` (default): existing response envelope.
- `format=csv`: `text/csv` attachment; UTF-8; tenant-scoped rows only.
- `format=pdf`: `application/pdf` attachment generated with PDFKit (or equivalent approved stack addition — **requires human approval if not already listed**; prefer a minimal dependency already acceptable, or generate PDF via a small pure approach if stack lock forbids new libs — default plan: request approval for `pdfkit` + `@types/pdfkit`).
- Sync generation for normal date ranges (≤ 31 days or ≤ configured row threshold). Larger ranges may enqueue BullMQ `reports` / `generate-report` and return `202` with `jobId` **only if** sync proves too heavy; V1 default is sync-first to keep clients simple.
- Require report view/export capabilities via permission middleware.

### 4.3 Jobs & FCM (harden existing)

**Already on branch (keep):**

- `apps/backend/src/modules/jobs/` — queues, workers, schedulers, auto punch-out, reminders, GPS aggregate, retention, orphan images
- `apps/backend/src/modules/notifications/` — FCM send, device token upsert, regularization triggers
- Device `fcm_token` migration; `POST /api/v1/auth/device/register`

**Harden:**

- Ensure graceful no-op when `REDIS_URL` or Firebase Admin env missing (no crash on boot).
- Confirm regularization submit/review enqueue paths.
- Attendance reminder → `send-push` for users without punch-in that UTC day (existing design).
- Invalid/expired FCM token cleanup on send failure.

### 4.4 Stack exception note

AGENTS.md locks dependencies. Adding `pdfkit` (or similar) for PDF export requires explicit approval listed in this approved design. **Approved as part of this V1 completion design** for report PDF generation only.

---

## 5. Web (Angular) design

**Primary surface for:** Command Center, Live Operations, People, Role Hierarchy, Policies, Approvals, Access Groups, Organization, Companies, Customers, Products, Orders, Reports, Settings, Profile.

**Complete:**

1. **Reports UI** — Date range + report type; actions Download CSV / Download PDF calling export APIs; loading/error/empty states; capability-gated buttons.
2. **Capability-aware navigation/actions** — Fill gaps where nav or destructive actions ignore entitlements/`CAN` helpers.
3. **Stabilize in-progress WIP** — People hierarchy role options + Role Hierarchy tenant picker already in working tree; finish type-safe and consistent with backend.

**Not in scope:** Field punch camera flows on web; FCM web client for V1.

---

## 6. Mobile (React Native) design

**Primary surface for:** Auth (login/MPIN/consent), attendance punch + history + regularization, visits/sales/inspections capture, offline sync, GPS team map + route playback, existing admin screens (users, companies, org, policies, access groups, platform capabilities, reports list).

**Complete:**

1. **FCM** — Keep/finish `src/services/notifications/pushNotifications.ts`; sync token post-login; foreground alert; store pending deep-link payload; Android/iOS project hooks for Firebase; **do not** invent fake google-services files with secrets.
2. **Biometric + MPIN** — Optional biometric unlock after successful MPIN setup/verify using a dedicated native biometrics library (stack exception: `@react-native-community/biometrics` or `react-native-biometrics` — **approved for V1**). Opt-in persisted in MMKV; MPIN always available as fallback; never store MPIN plaintext.
3. **Offline** — Verify sync engine paths for attendance/visits/sales/inspections; fix idempotency/retry bugs found during verification.
4. **Reports** — Lightweight consumer of export APIs (share/download CSV; PDF share when feasible).
5. **Menus** — Gate More/Configurations entries by entitled capability slugs from profile/permissions payload.

**Not in scope:** Cloning desktop admin tables; Play/App Store submission pipelines beyond build-ready config hooks.

---

## 7. Testing & verification

| Layer | Required |
|-------|----------|
| Backend unit | Permission helpers, report CSV builders, FCM invalid-token detection, job connection parsing (existing + new) |
| Backend | `tsc --noEmit`; focused Jest; integration tests when DB available |
| Web | `tsc --noEmit`; manual reports download smoke |
| Mobile | `tsc --noEmit`; Jest smoke (auth store + App); biometric/FCM mocked |

---

## 8. Operator checklist (human / ops — not automatable here)

| Item | Owner |
|------|-------|
| Firebase project + `google-services.json` + `GoogleService-Info.plist` | Human |
| Firebase Admin env (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) | Human |
| Redis URL in each environment | Human |
| Run Prisma migrate including `fcm_token` | Human / CI |
| R2 credentials | Human |
| Apple Developer + Play Console + signing keys | Human |
| Production JWT secrets rotation | Human |
| Real-device GPS + battery soak sign-off | Human |

---

## 9. Definition of Done

- [ ] Business API routes enforce capability permissions consistently
- [ ] Attendance, visits, sales, inspections reports support `format=json|csv|pdf`
- [ ] BullMQ workers/schedulers start when Redis configured; safe when not
- [ ] FCM dispatch path works when Firebase Admin configured; device register endpoint stable
- [ ] Web Reports can download CSV and PDF
- [ ] Mobile: MPIN + optional biometric; FCM client ready for native configs; offline field paths verified
- [ ] `tsc --noEmit` passes for backend, web, mobile; mobile Jest passes; backend unit tests for new logic pass
- [ ] Docs updated for env vars + operator checklist
- [ ] Final message lists remaining human-only items

---

## 10. Implementation order

1. Backend permission audit + wiring  
2. Backend report inspections + CSV/PDF export (+ tests)  
3. Backend jobs/FCM hardening pass  
4. Web reports export UI + capability gaps  
5. Mobile biometric + FCM project hooks + menu/offline fixes  
6. Docs + final verification + human checklist  

---

## 11. Approval record

- Parity model: **Option A** (role-appropriate)  
- Approach: **Finish-layer (1)**  
- Design reviewed conversationally: **approved 2026-11-17**  
- Stack exceptions for V1: **pdfkit** (PDF reports), **react-native biometrics library** (optional unlock)
