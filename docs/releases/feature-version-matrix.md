# Feature ↔ Version Matrix

Curated compatibility table for NetroTrack. Versions are **independent** SemVer lines:

- Backend: `apps/backend/package.json` → tags `backend-v*`
- Web: `apps/web/package.json` → tags `web-v*`
- Mobile: `apps/mobile/package.json` → tags `mobile-v*`

**Baseline note:** tooling baseline aligns `mobile` package + native to **1.1.0 (build 2)**; `backend` **1.0.0**; `web` **0.0.0** (`WEB_VERSION` constant). Fill exact SemVer ranges after the first Changesets cut.

| Feature / capability | Status | Backend | Web | Mobile | Notes / blockers |
|----------------------|--------|---------|-----|--------|------------------|
| Attendance punch + history + regularization | shipped | TBD | TBD | TBD | |
| GPS sync + live map + route playback | shipped | TBD | TBD | TBD | |
| Visits capture | partial | TBD | — / Coming Soon shell | TBD | Web page still Coming Soon |
| Sales orders | partial | TBD | — / Coming Soon shell | TBD | Web page still Coming Soon |
| Inspections | partial | TBD | — / Coming Soon shell | TBD | Web page still Coming Soon |
| Customers / products catalogue | partial | TBD | — / Coming Soon shell | TBD | Web shells Coming Soon |
| Reports JSON + CSV/PDF + inspections | partial | TBD | TBD (UI ready; nav disabled) | TBD (JSON list only) | Enable web nav; mobile export later |
| BullMQ jobs (auto punch-out, reminders, …) | shipped | TBD | — | — | Needs `REDIS_URL` |
| FCM push | partial | TBD | — | TBD | Needs Firebase Admin + native configs |
| Biometric unlock (opt-in after MPIN) | shipped | — | — | TBD | |
| Dynamic authorization / access groups | shipped | TBD | TBD | TBD | Some routes still role-only |
| Min app version force-upgrade | shipped | >=1.0.0 (app-config) | — | >=1.1.0 | `MIN_APP_VERSION_*` + ForceUpdateScreen |
