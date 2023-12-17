-- DropForeignKey
ALTER TABLE "ProductFile" DROP CONSTRAINT "ProductFile_productId_fkey";

-- AddForeignKey
ALTER TABLE "ProductFile" ADD CONSTRAINT "ProductFile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
