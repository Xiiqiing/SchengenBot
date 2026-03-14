declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface VapidDetails {
    subject: string;
    publicKey: string;
    privateKey: string;
  }

  interface SendResult {
    statusCode?: number;
    body?: string;
    headers?: Record<string, string>;
  }

  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;

  function sendNotification(
    subscription: PushSubscription,
    payload?: string,
    options?: Record<string, unknown>
  ): Promise<SendResult>;

  const webpush: {
    setVapidDetails: typeof setVapidDetails;
    sendNotification: typeof sendNotification;
  };

  export = webpush;
}
