import pino from 'pino';
import { prisma } from '../../../shared/config/prisma';
import { enqueueSendPush } from '../jobs.queues';

const logger = pino({ name: 'attendance-reminder' });

/**
 * Enqueue attendance reminders for active employees who have not punched in today (UTC day).
 * Tenant-scoped via companyId on every query.
 */
export async function runAttendanceReminders(now: Date = new Date()): Promise<number> {
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const companies = await prisma.company.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    select: { id: true },
  });

  let enqueued = 0;

  for (const company of companies) {
    const users = await prisma.user.findMany({
      where: {
        companyId: company.id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    });

    for (const user of users) {
      const punched = await prisma.attendance.findFirst({
        where: {
          companyId: company.id,
          userId: user.id,
          punchInTime: { gte: dayStart },
        },
        select: { id: true },
      });

      if (punched) continue;

      await enqueueSendPush({
        userId: user.id,
        title: 'Attendance Reminder',
        body: "Don't forget to punch in!",
        data: { type: 'ATTENDANCE_REMINDER', screen: 'Dashboard' },
      });
      enqueued += 1;
    }
  }

  logger.info({ enqueued }, 'Attendance reminders enqueued');
  return enqueued;
}
