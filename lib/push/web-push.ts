import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

let configured = false;
let configurationError: string | null = null;

export interface StoredPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function ensureConfigured() {
  if (configured) {
    return true;
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    configurationError = 'Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY';
    return false;
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    configured = true;
    configurationError = null;
    return true;
  } catch (error: any) {
    configurationError = error?.message || 'Invalid Web Push configuration';
    return false;
  }
}

export function isWebPushConfigured() {
  return ensureConfigured();
}

export function getWebPushConfigurationError() {
  ensureConfigured();
  return configurationError;
}

export function getVapidPublicKey() {
  return vapidPublicKey || '';
}

export async function sendWebPushNotification(
  subscription: StoredPushSubscription,
  payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
  }
) {
  if (!ensureConfigured()) {
    return {
      success: false,
      statusCode: 500,
      error: 'Web Push VAPID keys are not configured',
    };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );

    return {
      success: true,
      statusCode: 201,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      error: error?.body || error?.message || 'Unknown Web Push error',
    };
  }
}
