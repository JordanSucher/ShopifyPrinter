/*
  Warnings:

  - You are about to drop the column `CreatedAt` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `OrderId` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `PrintJob` table. All the data in the column will be lost.
  - You are about to drop the column `UpdatedAt` on the `PrintJob` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `PrintJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineItemId` to the `PrintJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `PrintJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `PrintJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PrintJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PrintJob" DROP COLUMN "CreatedAt",
DROP COLUMN "OrderId",
DROP COLUMN "Status",
DROP COLUMN "UpdatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lineItemId" INTEGER NOT NULL,
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductFile" ADD COLUMN     "localFilePath" TEXT;
