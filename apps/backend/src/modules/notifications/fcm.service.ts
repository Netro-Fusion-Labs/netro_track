import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, type Message } from 'firebase-admin/messaging';
import pino from 'pino';

const logger = pino({ name: 'fcm' });

export interface PushPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

function ensureFirebaseApp(): boolean {
  if (getApps().length > 0) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    logger.warn('Firebase Admin is not configured; push notifications are disabled');
    return false;
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return true;
}

export function buildPushMessage(payload: PushPayload): Message {
  return {
    token: payload.token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data ?? {},
  };
}

export function isInvalidFcmTokenError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: string }).code ?? '') : '';
  return (
    code === 'messaging/registration-token-not-registered' ||
    code === 'messaging/invalid-registration-token'
  );
}

export async function sendPushNotification(
  payload: PushPayload,
): Promise<'sent' | 'skipped' | 'invalid_token'> {
  if (!ensureFirebaseApp()) {
    return 'skipped';
  }

  try {
    await getMessaging().send(buildPushMessage(payload));
    return 'sent';
  } catch (error) {
    if (isInvalidFcmTokenError(error)) {
      logger.warn({ tokenSuffix: payload.token.slice(-6) }, 'FCM token invalid; clearing');
      return 'invalid_token';
    }
    logger.error({ err: error }, 'Failed to send FCM push');
    throw error;
  }
}
