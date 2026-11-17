import { buildPushMessage, isInvalidFcmTokenError } from '../fcm.service';

describe('fcm.service helpers', () => {
  it('builds a data+notification FCM message', () => {
    const message = buildPushMessage({
      token: 'device-token',
      title: 'Attendance Reminder',
      body: "Don't forget to punch in!",
      data: { type: 'ATTENDANCE_REMINDER', screen: 'Dashboard' },
    });

    expect(message).toEqual({
      token: 'device-token',
      notification: {
        title: 'Attendance Reminder',
        body: "Don't forget to punch in!",
      },
      data: {
        type: 'ATTENDANCE_REMINDER',
        screen: 'Dashboard',
      },
    });
  });

  it('detects invalid / expired FCM token errors', () => {
    expect(isInvalidFcmTokenError({ code: 'messaging/registration-token-not-registered' })).toBe(true);
    expect(isInvalidFcmTokenError({ code: 'messaging/invalid-registration-token' })).toBe(true);
    expect(isInvalidFcmTokenError({ code: 'messaging/internal-error' })).toBe(false);
    expect(isInvalidFcmTokenError(null)).toBe(false);
  });
});
