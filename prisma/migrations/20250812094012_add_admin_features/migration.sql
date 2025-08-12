-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BillboardStatus" ADD VALUE 'REJECTED';
ALTER TYPE "public"."BillboardStatus" ADD VALUE 'SUSPENDED';

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "public"."billboards" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_by" TEXT,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "suspended_at" TIMESTAMP(3),
ADD COLUMN     "suspended_by" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspended_at" TIMESTAMP(3);
