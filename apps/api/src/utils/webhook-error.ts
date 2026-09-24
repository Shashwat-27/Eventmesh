export class WebhookRetryableError extends Error {
  public readonly statusCode: number;
  public readonly retryAfterMs?: number;

  constructor(
    message: string,
    statusCode: number,
    retryAfterMs?: number
  ) {
    super(message);

    this.name = "WebhookRetryableError";
    this.statusCode = statusCode;
    this.retryAfterMs = retryAfterMs;
  }
}

export const isRetryableStatus = (
  statusCode: number
): boolean => {
  const retryableStatuses = new Set([
    408,
    429,
    500,
    502,
    503,
    504,
  ]);

  return retryableStatuses.has(statusCode);
};

export const parseRetryAfter = (
  value: string | null
): number | undefined => {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const retryDate = Date.parse(value);

  if (Number.isNaN(retryDate)) {
    return undefined;
  }

  const delay = retryDate - Date.now();

  return Math.max(delay, 0);
};