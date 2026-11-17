import pino from 'pino';
import { prisma } from '../../../shared/config/prisma';

const logger = pino({ name: 'retention-cleanup' });

const GPS_RETENTION_DAYS = 90;

/**
 * Delete GPS points older than retention window, scoped per company_id batches.
 */
export async function runRetentionCleanup(now: Date = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - GPS_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });

  let deleted = 0;
  for (const company of companies) {
    const result = await prisma.gpsLocation.deleteMany({
      where: {
        companyId: company.id,
        recordedAt: { lt: cutoff },
      },
    });
    deleted += result.count;
  }

  // Expired refresh sessions
  const sessions = await prisma.session.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  logger.info({ deletedGps: deleted, deletedSessions: sessions.count }, 'Retention cleanup complete');
  return deleted + sessions.count;
}
