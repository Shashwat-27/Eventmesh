declare global {
  namespace Express {
    interface Request {
      auth?: {
        apiKeyId: string;
        projectId: string;
      };
    }
  }
}

export {};