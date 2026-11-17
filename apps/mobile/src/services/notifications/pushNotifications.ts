import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
  getInitialNotification,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { api } from '../../shared/services/api';
import { storage } from '../../shared/utils/storage';

const DEVICE_ID_KEY = 'netrotrack_device_id';
const FCM_TOKEN_KEY = 'netrotrack_fcm_token';

type NotificationData = Record<string, string | undefined>;

let initialized = false;
let unsubscribeTokenRefresh: (() => void) | null = null;
let unsubscribeForeground: (() => void) | null = null;
let unsubscribeOpened: (() => void) | null = null;

function getOrCreateDeviceId(): string {
  const existing = storage.getString(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = `rn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  storage.set(DEVICE_ID_KEY, generated);
  return generated;
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  const messaging = getMessaging();
  const authStatus = await requestPermission(messaging);
  return (
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL
  );
}

async function syncTokenToBackend(token: string): Promise<void> {
  storage.set(FCM_TOKEN_KEY, token);
  await api.post('/auth/device/register', {
    deviceId: getOrCreateDeviceId(),
    fcmToken: token,
    os: Platform.OS,
    model: Platform.OS === 'ios' ? 'iOS' : 'Android',
    appVersion: '0.0.1',
  });
}

function handleNotificationTap(data?: NotificationData): void {
  if (!data?.type) return;
  storage.set(
    'pending_notification_route',
    JSON.stringify({
      type: data.type,
      screen: data.screen ?? 'Dashboard',
      entityId: data.entityId,
    }),
  );
}

function showForegroundAlert(title?: string, body?: string): void {
  if (!title && !body) return;
  Alert.alert(title ?? 'NetroTrack', body ?? '');
}

/**
 * Initialize FCM permissions, token sync, and listeners.
 * Safe to call multiple times; no-ops when Firebase native config is missing.
 */
export async function initPushNotifications(): Promise<void> {
  if (initialized) return;

  try {
    const messaging = getMessaging();
    const permitted = await ensurePermission();
    if (!permitted) return;

    const token = await getToken(messaging);
    if (token) {
      await syncTokenToBackend(token);
    }

    unsubscribeTokenRefresh = onTokenRefresh(messaging, (nextToken: string) => {
      void syncTokenToBackend(nextToken);
    });

    unsubscribeForeground = onMessage(messaging, async (remoteMessage: RemoteMessage) => {
      showForegroundAlert(
        remoteMessage.notification?.title,
        remoteMessage.notification?.body,
      );
    });

    unsubscribeOpened = onNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
      handleNotificationTap(remoteMessage.data as NotificationData | undefined);
    });

    const initial = await getInitialNotification(messaging);
    if (initial?.data) {
      handleNotificationTap(initial.data as NotificationData);
    }

    setBackgroundMessageHandler(messaging, async () => {
      // Background delivery is handled by the OS; token/data sync happens on open.
    });

    initialized = true;
  } catch {
    // Missing google-services / GoogleService-Info — keep app usable without push.
    initialized = false;
  }
}

export function teardownPushNotifications(): void {
  unsubscribeTokenRefresh?.();
  unsubscribeForeground?.();
  unsubscribeOpened?.();
  unsubscribeTokenRefresh = null;
  unsubscribeForeground = null;
  unsubscribeOpened = null;
  initialized = false;
}

/** Re-sync token after login once auth headers are available. */
export async function syncPushTokenAfterLogin(): Promise<void> {
  try {
    const messaging = getMessaging();
    const permitted = await ensurePermission();
    if (!permitted) return;
    const token = await getToken(messaging);
    if (token) {
      await syncTokenToBackend(token);
    }
  } catch {
    // ignore — push is best-effort
  }
}
