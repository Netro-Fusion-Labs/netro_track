import { prisma } from '../../shared/config/prisma';

export class NotificationRepository {
  public async findFcmTokensForUser(userId: string): Promise<Array<{ id: string; fcmToken: string }>> {
    const devices = await prisma.device.findMany({
      where: {
        userId,
        fcmToken: { not: null },
      },
      select: { id: true, fcmToken: true },
    });

    return devices
      .filter((d): d is { id: string; fcmToken: string } => Boolean(d.fcmToken))
      .map((d) => ({ id: d.id, fcmToken: d.fcmToken }));
  }

  public async clearFcmToken(deviceId: string): Promise<void> {
    await prisma.device.update({
      where: { id: deviceId },
      data: { fcmToken: null },
    });
  }

  public async upsertDeviceFcmToken(input: {
    userId: string;
    deviceId: string;
    fcmToken: string;
    os?: string;
    model?: string;
    appVersion?: string;
  }): Promise<void> {
    const existing = await prisma.device.findUnique({
      where: {
        userId_deviceId: {
          userId: input.userId,
          deviceId: input.deviceId,
        },
      },
    });

    if (existing) {
      await prisma.device.update({
        where: { id: existing.id },
        data: {
          fcmToken: input.fcmToken,
          ...(input.os ? { os: input.os } : {}),
          ...(input.model ? { model: input.model } : {}),
          ...(input.appVersion ? { appVersion: input.appVersion } : {}),
        },
      });
      return;
    }

    await prisma.device.create({
      data: {
        userId: input.userId,
        deviceId: input.deviceId,
        fcmToken: input.fcmToken,
        os: input.os ?? 'unknown',
        model: input.model ?? 'unknown',
        appVersion: input.appVersion ?? '0.0.0',
      },
    });
  }
}

export const notificationRepository = new NotificationRepository();
