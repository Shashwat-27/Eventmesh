import { createHmac } from "node:crypto";

export const generateWebhookSignature = (
  secret: string,
  payload: string
) => {
  const signature = createHmac(
    "sha256",
    secret
  )
    .update(payload)
    .digest("hex");

  return `sha256=${signature}`;
};