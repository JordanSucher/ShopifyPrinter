/*
  Warnings:

  - You are about to drop the column `printerId` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_printerId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "printerId";

-- CreateTable
CREATE TABLE "FilePrinterMappings" (
    "fileId" INTEGER NOT NULL,
    "printerId" INTEGER NOT NULL,

    CONSTRAINT "FilePrinterMappings_pkey" PRIMARY KEY ("fileId","printerId")
);

-- AddForeignKey
ALTER TABLE "FilePrinterMappings" ADD CONSTRAINT "FilePrinterMappings_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePrinterMappings" ADD CONSTRAINT "FilePrinterMappings_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
