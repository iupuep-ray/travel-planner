import app from '@/lib/firebase';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { savePushToken } from '@/services/pushTokenService';
import { buildTodoNotificationMessage } from '@/services/browserNotificationService';

const BASE_PATH = '/travel-planner';
const FCM_SW_URL = `${BASE_PATH}/firebase-messaging-sw.js`;
const FCM_SW_SCOPE = `${BASE_PATH}/firebase-cloud-messaging-push-scope`;
let foregroundUnsubscribe: (() => void) | null = null;
let registeredAuthUid: string | null = null;

const getVapidKey = (): string => {
  return import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
};

const showForegroundNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body });
};

export const registerFcmForUser = async (authUid: string): Promise<void> => {
  if (registeredAuthUid === authUid) return;
  if (!app) return;
  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return;
  if (Notification.permission === 'denied') return;

  const vapidKey = getVapidKey();
  if (!vapidKey) {
    console.warn('VITE_FIREBASE_VAPID_KEY 未設定，略過 FCM 註冊');
    return;
  }

  const supported = await isSupported();
  if (!supported) return;

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }

  const swRegistration = await navigator.serviceWorker.register(FCM_SW_URL, {
    scope: FCM_SW_SCOPE,
  });

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: swRegistration,
  });

  if (!token) return;
  await savePushToken(authUid, token);

  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
  }

  foregroundUnsubscribe = onMessage(messaging, (payload) => {
    const title = payload.notification?.title || '待辦事項提醒';
    const todoContent = payload.data?.todoContent;
    const body =
      payload.notification?.body ||
      (todoContent ? buildTodoNotificationMessage(todoContent) : '你有一筆待辦事項尚未完成');

    showForegroundNotification(title, body);
  });

  registeredAuthUid = authUid;
};

export const clearFcmRegistrationState = () => {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }
  registeredAuthUid = null;
};
