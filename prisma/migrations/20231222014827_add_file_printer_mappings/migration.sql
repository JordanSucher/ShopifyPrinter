-- AlterTable
ALTER TABLE "File" ADD COLUMN     "latestPrinterUsedId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_latestPrinterUsedId_fkey" FOREIGN KEY ("latestPrinterUsedId") REFERENCES "Printer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
