-- CreateTable
CREATE TABLE "PrintJob" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "OrderId" INTEGER NOT NULL,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);
