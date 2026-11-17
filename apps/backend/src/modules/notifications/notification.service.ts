import { enqueueSendPush } from '../jobs/jobs.queues';
import { sendPushNotification } from './fcm.service';
import { notificationRepository } from './notification.repository';

export class NotificationService {
  public async enqueueUserPush(input: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    await enqueueSendPush(input);
  }

  public async dispatchSendPushJob(input: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    const tokens = await notificationRepository.findFcmTokensForUser(input.userId);
    for (const device of tokens) {
      const result = await sendPushNotification({
        token: device.fcmToken,
        title: input.title,
        body: input.body,
        data: input.data,
      });
      if (result === 'invalid_token') {
        await notificationRepository.clearFcmToken(device.id);
      }
    }
  }

  public async registerDeviceToken(input: {
    userId: string;
    deviceId: string;
    fcmToken: string;
    os?: string;
    model?: string;
    appVersion?: string;
  }): Promise<void> {
    await notificationRepository.upsertDeviceFcmToken(input);
  }

  public async notifyRegularizationSubmitted(input: {
    requesterId: string;
    managerId: string | null;
    companyId: string;
    requestId: string;
  }): Promise<void> {
    if (!input.managerId) return;
    await this.enqueueUserPush({
      userId: input.managerId,
      title: 'Regularization Request',
      body: 'A team member submitted an attendance regularization request.',
      data: {
        type: 'REGULARIZATION_SUBMITTED',
        screen: 'RegularizationApprovals',
        entityId: input.requestId,
        companyId: input.companyId,
      },
    });
  }

  public async notifyRegularizationReviewed(input: {
    requesterId: string;
    action: 'APPROVED' | 'REJECTED';
    requestId: string;
  }): Promise<void> {
    await this.enqueueUserPush({
      userId: input.requesterId,
      title: 'Regularization Update',
      body:
        input.action === 'APPROVED'
          ? 'Your attendance regularization was approved.'
          : 'Your attendance regularization was rejected.',
      data: {
        type: input.action === 'APPROVED' ? 'REGULARIZATION_APPROVED' : 'REGULARIZATION_REJECTED',
        screen: 'RegularizationHistory',
        entityId: input.requestId,
      },
    });
  }
}

export const notificationService = new NotificationService();
