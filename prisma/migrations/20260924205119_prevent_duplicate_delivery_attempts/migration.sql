/*
  Warnings:

  - A unique constraint covering the columns `[deliveryId,attemptNo]` on the table `DeliveryAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAttempt_deliveryId_attemptNo_key" ON "DeliveryAttempt"("deliveryId", "attemptNo");
