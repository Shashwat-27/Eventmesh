-- CreateTable
CREATE TABLE "DeliveryAttempt" (
    "id" UUID NOT NULL,
    "deliveryId" UUID NOT NULL,
    "attemptNo" INTEGER NOT NULL,
    "statusCode" INTEGER,
    "durationMs" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryAttempt_deliveryId_idx" ON "DeliveryAttempt"("deliveryId");

-- CreateIndex
CREATE INDEX "DeliveryAttempt_createdAt_idx" ON "DeliveryAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
