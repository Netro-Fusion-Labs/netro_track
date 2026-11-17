# V1 Role-Parity Completion Implementation Plan

> **For agentic workers:** Execute task-by-task. Prefer continuous execution without waiting for human approval (owner trust granted 2026-11-17).

**Goal:** Finish V1 backend completeness + role-appropriate web/mobile parity per `docs/superpowers/specs/2026-11-17-v1-role-parity-completion-design.md`.

**Architecture:** Harden existing Express/Prisma/BullMQ/FCM stack; add report CSV/PDF; wire `requirePermission` on business routes; Angular reports downloads; mobile biometric + FCM hooks. No desktop-admin clones on mobile.

**Tech Stack:** Node/Express/Prisma/BullMQ/firebase-admin/pdfkit; Angular web; RN + biometrics + Firebase messaging.

## Global Constraints

- Multi-tenant: `companyId` from JWT only for data access
- AGENTS.md layered architecture
- Stack exceptions approved in spec: `pdfkit`, RN biometrics library
- Commit as Boston Tech India `<dynamic92@gmail.com>`; no Co-Authored-By
- Do not invent Firebase secret files

---

### Task 1: Permission middleware on business routes

**Files:** Modify all `apps/backend/src/modules/*/`.routes.ts (except public auth routes)

- [x] Map endpoints to capability slugs from seed tree
- [x] Apply `requirePermission('slug')` after `authenticateToken`
- [x] `tsc --noEmit` + commit

### Task 2: Report CSV/PDF + inspections report

**Files:** `report.service.ts`, `report.controller.ts`, `report.routes.ts`, `report.repository.ts`, export helpers, tests

- [x] Add inspections report query
- [x] Add `format=json|csv|pdf` handling with pdfkit
- [x] Unit tests for CSV builder
- [x] Commit

### Task 3: Harden jobs/FCM

**Files:** `jobs.lifecycle.ts`, `server.ts`, notifications (already largely done)

- [x] Confirm soft-fail without Redis/Firebase
- [x] Commit any hardening

### Task 4: Web reports export UI

**Files:** `apps/web/src/app/features/reports/*`

- [x] CSV/PDF download buttons wired to API
- [x] `tsc --noEmit`
- [x] Commit

### Task 5: Mobile biometric + FCM project hooks

**Files:** auth screens, push service, android/ios gradle/plist hooks docs

- [x] Install biometrics lib; opt-in after MPIN
- [x] Android/iOS Firebase plugin hooks (without secret files)
- [x] Menu capability gating where missing
- [x] Jest + tsc
- [x] Commit

### Task 6: Docs + verification + human checklist

- [x] Update env docs
- [x] Run tsc/tests
- [x] Summarize remaining human items
