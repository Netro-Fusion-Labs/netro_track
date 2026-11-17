# Dynamic Authorization Engine

> **Purpose:** Document the enterprise capability / entitlement / access-group model implemented in NetroTrack.
> **Dependencies:** [Authentication & Authorization](authentication-authorization.md), [Multi-Tenancy](multi-tenancy.md), [User Management](../features/user-management.md)

---

## Overview

NetroTrack uses a **dynamic authorization** layer on top of system roles:

| Model | Table | Purpose |
|-------|-------|---------|
| `SystemCapability` | `system_capabilities` | Global capability tree (MODULE → FEATURE → ACTION) with slug keys |
| `CompanyEntitlement` | `company_entitlements` | Which capabilities a tenant is entitled to use |
| `AccessGroup` | `access_groups` | Named permission sets per `company_id` |
| `AccessGroupPermission` | `access_group_permissions` | Capability membership inside an access group |
| `UserAccessGroup` | `user_access_groups` | User ↔ group assignment |
| `UserTimelineEvent` | `user_timeline_events` | Immutable people/org change audit trail |
| `CompanyRole` | `company_roles` | Tenant-defined approval hierarchy ranks |

Effective permissions for a user are:

```
entitled company capabilities ∩ (access-group capabilities ∪ role defaults)
```

Results are cached in Redis (`perms:effective:{companyId}:{userId}`, 5-minute TTL).

## Tenant Isolation

- Every entitlement, access group, and timeline event is scoped by `company_id`.
- Platform admins may manage tenant hierarchies via explicit JWT-derived company context / query override for platform roles only — never trust client-supplied `companyId` for field-employee data access.

## Role Hierarchy

Tenants define approval authority via `CompanyRole` ranks (lower number = higher authority). Rank `1` is reserved for the system Company Admin role. See [Role Hierarchy](../security/role-hierarchy.md) and the Angular Role Hierarchy screen in `apps/web`.

## Code Locations

| Concern | Path |
|---------|------|
| Capability seeding | `apps/backend/prisma/seed-capabilities.ts` |
| Authorization module | `apps/backend/src/modules/authorization/` |
| Role hierarchy module | `apps/backend/src/modules/role-hierarchy/` |
| Permission cache | `apps/backend/src/shared/services/permission.service.ts` |
| Web People / Access Groups UI | `apps/web/src/app/features/people/`, `apps/web/src/app/features/role-hierarchy/` |
