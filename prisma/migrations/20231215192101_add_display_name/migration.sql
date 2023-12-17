/*
  Warnings:

  - Added the required column `displayName` to the `ProductFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductFile" ADD COLUMN     "displayName" TEXT NOT NULL;
