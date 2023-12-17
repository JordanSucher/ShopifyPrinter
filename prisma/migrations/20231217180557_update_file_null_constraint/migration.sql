-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_printerId_fkey";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "printerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
