import { subscriptionToRecord, urlBase64ToUint8Array } from './subscription-utils';

export function isWebPushSupported() {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}

export async function registerPushServiceWorker() {
  if (!isWebPushSupported()) {
    throw new Error('Web Push is not supported in this browser');
  }

  return await navigator.serviceWorker.register('/sw.js');
}

export async function getExistingPushSubscription() {
  const registration = await registerPushServiceWorker();
  return await registration.pushManager.getSubscription();
}

export async function subscribeToPush(vapidPublicKey: string) {
  const registration = await registerPushServiceWorker();
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted');
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription;
  }

  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

export async function unsubscribeFromPush() {
  const existingSubscription = await getExistingPushSubscription();
  if (!existingSubscription) {
    return;
  }

  await existingSubscription.unsubscribe();
}

export function serializePushSubscription(subscription: PushSubscription) {
  return subscriptionToRecord(subscription);
}
