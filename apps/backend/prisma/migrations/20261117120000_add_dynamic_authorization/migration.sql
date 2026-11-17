-- CreateEnum (may already exist if schema was partially applied outside migrations)
DO $$ BEGIN
  CREATE TYPE "CapabilityType" AS ENUM ('MODULE', 'FEATURE', 'ACTION');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "system_capabilities" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "type" "CapabilityType" NOT NULL,
    "key" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "company_entitlements" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "capability_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "access_groups" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "access_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "access_group_permissions" (
    "id" UUID NOT NULL,
    "access_group_id" UUID NOT NULL,
    "capability_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_access_groups" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "access_group_id" UUID NOT NULL,
    "assigned_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_access_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_direct_permissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "capability_id" UUID NOT NULL,
    "assigned_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_direct_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "system_capabilities_slug_key" ON "system_capabilities"("slug");
CREATE INDEX IF NOT EXISTS "system_capabilities_parent_id_idx" ON "system_capabilities"("parent_id");
CREATE INDEX IF NOT EXISTS "system_capabilities_type_idx" ON "system_capabilities"("type");
CREATE INDEX IF NOT EXISTS "system_capabilities_slug_idx" ON "system_capabilities"("slug");
CREATE INDEX IF NOT EXISTS "system_capabilities_is_active_idx" ON "system_capabilities"("is_active");
CREATE INDEX IF NOT EXISTS "company_entitlements_company_id_is_enabled_idx" ON "company_entitlements"("company_id", "is_enabled");
CREATE UNIQUE INDEX IF NOT EXISTS "company_entitlements_company_id_capability_id_key" ON "company_entitlements"("company_id", "capability_id");
CREATE INDEX IF NOT EXISTS "access_groups_company_id_is_active_idx" ON "access_groups"("company_id", "is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "access_groups_company_id_name_key" ON "access_groups"("company_id", "name");
CREATE INDEX IF NOT EXISTS "access_group_permissions_access_group_id_idx" ON "access_group_permissions"("access_group_id");
CREATE INDEX IF NOT EXISTS "access_group_permissions_capability_id_idx" ON "access_group_permissions"("capability_id");
CREATE UNIQUE INDEX IF NOT EXISTS "access_group_permissions_access_group_id_capability_id_key" ON "access_group_permissions"("access_group_id", "capability_id");
CREATE INDEX IF NOT EXISTS "user_access_groups_user_id_idx" ON "user_access_groups"("user_id");
CREATE INDEX IF NOT EXISTS "user_access_groups_access_group_id_idx" ON "user_access_groups"("access_group_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_access_groups_user_id_access_group_id_key" ON "user_access_groups"("user_id", "access_group_id");
CREATE INDEX IF NOT EXISTS "user_direct_permissions_user_id_company_id_idx" ON "user_direct_permissions"("user_id", "company_id");
CREATE INDEX IF NOT EXISTS "user_direct_permissions_capability_id_idx" ON "user_direct_permissions"("capability_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_direct_permissions_user_id_capability_id_key" ON "user_direct_permissions"("user_id", "capability_id");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  ALTER TABLE "system_capabilities" ADD CONSTRAINT "system_capabilities_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "system_capabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "company_entitlements" ADD CONSTRAINT "company_entitlements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "company_entitlements" ADD CONSTRAINT "company_entitlements_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "system_capabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "access_groups" ADD CONSTRAINT "access_groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "access_group_permissions" ADD CONSTRAINT "access_group_permissions_access_group_id_fkey" FOREIGN KEY ("access_group_id") REFERENCES "access_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "access_group_permissions" ADD CONSTRAINT "access_group_permissions_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "system_capabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_access_groups" ADD CONSTRAINT "user_access_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_access_groups" ADD CONSTRAINT "user_access_groups_access_group_id_fkey" FOREIGN KEY ("access_group_id") REFERENCES "access_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_access_groups" ADD CONSTRAINT "user_access_groups_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_direct_permissions" ADD CONSTRAINT "user_direct_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_direct_permissions" ADD CONSTRAINT "user_direct_permissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_direct_permissions" ADD CONSTRAINT "user_direct_permissions_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "system_capabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_direct_permissions" ADD CONSTRAINT "user_direct_permissions_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
