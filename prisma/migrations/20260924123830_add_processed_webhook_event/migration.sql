-- CreateTable
CREATE TABLE "ProcessedWebhookEvent" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "webhookEndpointId" UUID NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedWebhookEvent_eventId_idx" ON "ProcessedWebhookEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedWebhookEvent_eventId_webhookEndpointId_key" ON "ProcessedWebhookEvent"("eventId", "webhookEndpointId");
