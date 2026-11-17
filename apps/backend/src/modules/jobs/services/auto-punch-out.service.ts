import { Prisma } from '@prisma/client';
import pino from 'pino';
import { prisma } from '../../../shared/config/prisma';

const logger = pino({ name: 'auto-punch-out' });

const DEFAULT_TIMEZONE = 'UTC';

export function computeWorkingHours(punchIn: Date, punchOut: Date): number {
  const hours = (punchOut.getTime() - punchIn.getTime()) / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
}

export function isCompanyAtLocalMidnight(
  timezone: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const tz = timezone?.trim() || DEFAULT_TIMEZONE;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
      minute: 'numeric',
    }).formatToParts(now);

    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '-1');
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '-1');
    // Treat the first hour after local midnight as the auto punch-out window.
    return hour === 0 && minute < 60;
  } catch {
    logger.warn({ timezone: tz }, 'Invalid company timezone; skipping midnight check');
    return false;
  }
}

export async function runAutoPunchOut(now: Date = new Date()): Promise<number> {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    select: { id: true, timezone: true },
  });

  let closedCount = 0;

  for (const company of companies) {
    if (!isCompanyAtLocalMidnight(company.timezone, now)) {
      continue;
    }

    const openPunches = await prisma.attendance.findMany({
      where: {
        companyId: company.id,
        punchOutTime: null,
      },
    });

    for (const punch of openPunches) {
      const punchOutTime = now;
      const workingHours = computeWorkingHours(punch.punchInTime, punchOutTime);

      await prisma.attendance.update({
        where: { id: punch.id },
        data: {
          punchOutTime,
          workingHours: new Prisma.Decimal(workingHours),
          punchOutEvidence: {
            auto: true,
            reason: 'MIDNIGHT_AUTO_PUNCH_OUT',
          } as Prisma.InputJsonValue,
        },
      });
      closedCount += 1;
    }

    if (openPunches.length > 0) {
      logger.info(
        { companyId: company.id, closed: openPunches.length },
        'Auto punch-out completed for tenant',
      );
    }
  }

  return closedCount;
}
