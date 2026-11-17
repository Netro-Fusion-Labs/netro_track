# Release Roadmap

> **Purpose:** Future vision and feature rollout plan beyond V1.
> **Dependencies:** [Execution Plan](execution-plan.md)

---

## Version 1 (MVP + Core)
*Target: Field Sales & Service foundation*

- Multi-tenant architecture.
- GPS background tracking & live map.
- Attendance (Punch in/out) + regularization approvals.
- Customer Visits & Photos.
- Product Sales & basic catalog.
- Field Inspections.
- Role-based mobile dashboards.
- Offline-first data capture.
- BullMQ background jobs (attendance reminders, GPS aggregation, retention, orphan image cleanup, midnight auto punch-out).
- FCM push notifications (device token registration + async dispatch).
- Dynamic authorization (capabilities, entitlements, access groups, company role hierarchy).

### Brought forward from V2 (already implemented)
- **Web Admin Portal** — Angular standalone app in `apps/web/` (Command Center, Live Ops, People, Role Hierarchy, Policies, Customers, Products, Inspections, Reports). See [Web Portal Architecture](../architecture/web-portal-architecture.md).

## Version 2 (Enterprise Features)
*Target: Mid-market expansion*

- **Web Portal Analytics Expansion** (deeper reporting / PDF export polish — portal shell already shipped).
- **Task Management**: Dispatch tasks to field agents.
- **Geofencing**: Alerts when entering/leaving zones.
- **Leave Management**: Request and approve time off.
- **Expense Tracking**: Receipt upload and approval.
- **Custom Forms**: Dynamic form builder for visits/inspections.
- **Bulk Imports**: CSV imports for customers, products, employees.

## Version 3 (Advanced & Platform)
*Target: Large enterprise & white-label*

- **White-labeling**: Custom app branding per company.
- **Billing & Subscriptions**: Stripe integration, usage tiers.
- **AI Insights**: Anomaly detection (fake GPS, unusual sales).
- **Route Optimization**: AI-suggested daily travel routes.
- **Open API**: Webhooks and REST API for ERP integration.
- **Advanced Roles**: Further customization beyond the shipped capability / access-group engine.
