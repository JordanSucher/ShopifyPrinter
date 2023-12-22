-- DropForeignKey
ALTER TABLE "FilePrinterMappings" DROP CONSTRAINT "FilePrinterMappings_printerId_fkey";

-- AddForeignKey
ALTER TABLE "FilePrinterMappings" ADD CONSTRAINT "FilePrinterMappings_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
