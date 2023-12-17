-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PRINTING', 'DONE');

-- AlterTable
ALTER TABLE "PrintJob" ADD COLUMN     "Status" "Status" NOT NULL DEFAULT 'PENDING';
