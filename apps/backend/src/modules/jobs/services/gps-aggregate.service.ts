import pino from 'pino';
import { prisma } from '../../../shared/config/prisma';

const logger = pino({ name: 'gps-aggregate' });

/**
 * Aggregate previous-day GPS point counts per tenant/user for retention analytics.
 * Stores a compact audit log entry (no PII) so raw GPS can later be pruned safely.
 */
export async function runGpsDailyAggregation(referenceDate: Date = new Date()): Promise<number> {
  const dayStart = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate() - 1,
    0, 0, 0, 0,
  ));
  const dayEnd = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
    0, 0, 0, 0,
  ));

  const groups = await prisma.gpsLocation.groupBy({
    by: ['companyId', 'userId'],
    where: {
      recordedAt: { gte: dayStart, lt: dayEnd },
    },
    _count: { _all: true },
  });

  for (const group of groups) {
    await prisma.auditLog.create({
      data: {
        companyId: group.companyId,
        userId: group.userId,
        action: 'GPS_DAILY_AGGREGATE',
        entityType: 'GpsLocation',
        metadata: {
          day: dayStart.toISOString().slice(0, 10),
          pointCount: group._count._all,
        },
      },
    });
  }

  logger.info({ groups: groups.length, day: dayStart.toISOString().slice(0, 10) }, 'GPS daily aggregation complete');
  return groups.length;
}
