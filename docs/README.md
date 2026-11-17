# NetroTrack Documentation

> **Enterprise-grade documentation for the NetroTrack Field Workforce Management Platform.**

---

## Quick Navigation

### Product
| Document | Purpose |
|----------|---------|
| [Product Overview](product/product-overview.md) | Vision, mission, objectives, target industries |
| [Product Philosophy](product/product-philosophy.md) | Design principles and product values |
| [User Roles](product/user-roles.md) | Role definitions, permissions matrix |
| [User Workflows](product/user-workflows.md) | Daily workflows for each role |
| [Business Rules](product/business-rules.md) | Complete business rules catalog |
| [Glossary](product/glossary.md) | Domain terminology dictionary |

### Architecture
| Document | Purpose |
|----------|---------|
| [System Architecture](architecture/system-architecture.md) | Infrastructure, deployment topology |
| [Application Architecture](architecture/application-architecture.md) | Layered architecture, module isolation |
| [Multi-Tenancy](architecture/multi-tenancy.md) | Tenant isolation, data boundaries |
| [Authentication & Authorization](architecture/authentication-authorization.md) | JWT, MPIN, biometric, RBAC |
| [Dynamic Authorization](architecture/dynamic-authorization.md) | Capabilities, entitlements, access groups, timeline |
| [Realtime Architecture](architecture/realtime-architecture.md) | Socket.IO, live tracking |
| [Offline Architecture](architecture/offline-architecture.md) | Offline-first, sync engine |
| [Image Upload Architecture](architecture/image-upload-architecture.md) | Signed URL flow, R2 integration |
| [GPS Tracking Architecture](architecture/gps-tracking-architecture.md) | Background tracking, batch sync |
| [Scalability Architecture](architecture/scalability-architecture.md) | Horizontal scaling, caching |
| [Web Portal Architecture](architecture/web-portal-architecture.md) | Angular admin portal (`apps/web`) |

### Features
| Document | Purpose |
|----------|---------|
| [Feature Specifications](features/feature-specifications.md) | Consolidated auth, attendance, tracking, visits, sales, inspections, reports, notifications, dashboards |
| [Attendance Regularization](features/attendance-regularization.md) | Regularization requests and approval workflow |
| [User Management](features/user-management.md) | User creation, Access Roles, Designation Titles, Timeline Audit Engine |
| [Feature Flags](features/feature-flags.md) | Module entitlements and feature toggles |

### Backend
| Document | Purpose |
|----------|---------|
| [Backend Overview](backend/backend-overview.md) | Architecture and patterns |
| [Folder Structure](backend/folder-structure.md) | Directory layout |
| [API Design](backend/api-design.md) | REST conventions, response format |
| [API Reference](backend/api-reference.md) | Complete endpoint catalog |
| [Middleware Strategy](backend/middleware-strategy.md) | Middleware chain |
| [Service Layer](backend/service-layer.md) | Business logic organization |
| [Repository Layer](backend/repository-layer.md) | Data access patterns |
| [Socket Events](backend/socket-events.md) | Real-time event catalog |
| [Background Jobs](backend/background-jobs.md) | BullMQ job definitions |
| [Validation Strategy](backend/validation-strategy.md) | Zod schemas |
| [Error Handling](backend/error-handling.md) | Error codes, error classes |
| [Logging & Monitoring](backend/logging-monitoring.md) | Pino, health endpoints |
| [Caching Strategy](backend/caching-strategy.md) | Redis patterns |

### Mobile
| Document | Purpose |
|----------|---------|
| [Mobile Overview](mobile/mobile-overview.md) | Architecture and patterns |
| [Folder Structure](mobile/folder-structure.md) | Directory layout |
| [Navigation Hierarchy](mobile/navigation-hierarchy.md) | Navigators and screens |
| [Screen Inventory](mobile/screen-inventory.md) | Complete screen catalog |
| [Component Strategy](mobile/component-strategy.md) | Reusable components |
| [State Management](mobile/state-management.md) | Zustand + TanStack Query |
| [Offline Strategy](mobile/offline-strategy.md) | MMKV queues, sync engine |
| [Background Tracking](mobile/background-tracking.md) | GPS service |
| [Push Notifications](mobile/push-notifications.md) | FCM integration |
| [Performance Strategy](mobile/performance-strategy.md) | Optimization techniques |
| [Battery Optimization](mobile/battery-optimization.md) | Power-efficient tracking |
| [Error Handling](mobile/error-handling.md) | Error boundaries, retry |

### Database
| Document | Purpose |
|----------|---------|
| [Database Overview](database/database-overview.md) | PostgreSQL/Neon strategy |
| [Entity Relationship](database/entity-relationship.md) | Complete ERD |
| [Schema Reference](database/schema-reference.md) | All tables and columns |
| [Indexing Strategy](database/indexing-strategy.md) | Index catalog |
| [Naming Conventions](database/naming-conventions.md) | Database naming standards |
| [Audit Strategy](database/audit-strategy.md) | Audit columns and log |
| [Soft Delete Strategy](database/soft-delete-strategy.md) | Soft delete pattern |
| [Migration Strategy](database/migration-strategy.md) | Prisma migrations |
| [Data Retention](database/data-retention.md) | GPS retention, archival |

### Design System
| Document | Purpose |
|----------|---------|
| [Design System Overview](design-system/design-system-overview.md) | Philosophy and architecture |
| [Theme Engine](design-system/theme-engine.md) | Multi-theme, dynamic, white-label |
| [Animation Guidelines](design-system/animation-guidelines.md) | Motion and transition standards |

### Security
| Document | Purpose |
|----------|---------|
| [Security Overview](security/security-overview.md) | Security architecture |
| [Role Hierarchy](security/role-hierarchy.md) | Tenant company-role ranks and approval authority |
| [Environment Variables](security/environment-variables.md) | Secrets and runtime configuration catalog |

### Development
| Document | Purpose |
|----------|---------|
| [Development Setup](development/development-setup.md) | Local environment |
| [Coding Standards](development/coding-standards.md) | TypeScript, ESLint, Prettier |
| [Git Workflow](development/git-workflow.md) | Branching strategy |
| [NPM Workspaces](development/npm-workspaces.md) | Monorepo package management |
| [AGENTS.md](../AGENTS.md) | AI/coding standards (folder conventions, commit style, review rules) |

### Testing
| Document | Purpose |
|----------|---------|
| [Testing Strategy](testing/testing-strategy.md) | Test pyramid, coverage |
| [Backend Testing](testing/backend-testing.md) | API test patterns |
| [Mobile Testing](testing/mobile-testing.md) | Component test patterns |

### Deployment
| Document | Purpose |
|----------|---------|
| [Deployment Overview](deployment/deployment-overview.md) | CI/CD architecture |
| [CI/CD Pipeline](deployment/ci-cd-pipeline.md) | GitHub Actions (see also `.github/workflows/`) |
| [Infrastructure as Code](../.github/workflows/terraform.yml) | Terraform provisioning workflow |
| [Production Deploy Workflow](../.github/workflows/production.yml) | Production release pipeline |

### Releases
| Document | Purpose |
|----------|---------|
| [Releases README](releases/README.md) | Changesets workflow, tags, sync script |
| [Feature ↔ Version Matrix](releases/feature-version-matrix.md) | Cross-app feature compatibility |
| [Release Checklist](ops/release-checklist.md) | Operator steps for cutting a release |

### Planning & Roadmap
| Document | Purpose |
|----------|---------|
| [Execution Plan](planning/execution-plan.md) | Project execution strategy (includes sprint/critical-path guidance) |
| [Release Roadmap](roadmap/release-roadmap.md) | V1–V3 rollout plan |

---

## Reading Order

For new team members, read in this order:

1. `NETROTRACK_PRODUCT_BIBLE.md` (root) — Product specification
2. `AGENTS.md` (root) — AI and coding standards
3. `product/` — Understand the domain
4. `architecture/` — Understand the system design
5. `database/` — Understand the data model
6. `backend/` — Understand the API layer
7. `mobile/` — Understand the client
8. `design-system/` — Understand the UI framework
9. `features/` — Deep dive into each module
10. `security/` → `development/` → `testing/` → `deployment/` → `planning/`

---

## Versioning

App releases use independent SemVer (backend / web / mobile) via Changesets — see [releases/README.md](releases/README.md). Documentation changes are tracked via Git history.

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2026-07-13 | Initial documentation repository |
| 0.2.0 | 2026-11-17 | Fixed dead index links; documented Angular web portal + dynamic authorization + BullMQ/FCM |
