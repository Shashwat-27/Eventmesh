import express from "express";
import "./config/load-env.js";
import { prisma } from "./services/prisma.services.js";

const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  const eventId = req.header("X-EventMesh-Event-ID");
  const webhookEndpointId = req.header(
    "X-EventMesh-Webhook-Endpoint-ID"
  );

  if (!eventId) {
    return res.status(400).json({
      error: "Missing event ID",
    });
  }

  if (!webhookEndpointId) {
    return res.status(400).json({
      error: "Missing webhook endpoint ID",
    });
  }

  try {
    const existingEvent =
      await prisma.processedWebhookEvent.findUnique({
        where: {
          eventId_webhookEndpointId: {
            eventId,
            webhookEndpointId,
          },
        },
      });

    if (existingEvent) {
      console.log("DUPLICATE EVENT:", eventId);

      return res.status(200).json({
        received: true,
        duplicate: true,
      });
    }

    console.log("PROCESSING NEW EVENT:", eventId);

    console.log(
      "Body:",
      JSON.stringify(req.body, null, 2)
    );

    /*
     * Simulate:
     * Consumer processes the event successfully,
     * but the response fails.
     *
     * EventMesh will therefore retry the same event.
     */
    try {
      await prisma.processedWebhookEvent.create({
        data: {
          eventId,
          webhookEndpointId,
        },
      });
    } catch (error: unknown) {
      /*
       * Another concurrent request may have inserted
       * the same event first.
       *
       * PostgreSQL's unique constraint protects us here.
       */
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        console.log("DUPLICATE EVENT (CONCURRENT):", eventId);

        return res.status(200).json({
          received: true,
          duplicate: true,
        });
      }

      throw error;
    }

    return res.status(500).json({
      received: true,
      simulated: "response lost after processing",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      error: "Internal webhook test server error",
    });
  }
});

app.listen(4000, () => {
  console.log("Test webhook server running on port 4000");
});