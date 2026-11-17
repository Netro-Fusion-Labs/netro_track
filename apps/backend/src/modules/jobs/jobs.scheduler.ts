import pino from 'pino';
import { isJobsEnabled } from './jobs.connection';
import { JOB_NAMES } from './jobs.constants';
import {
  getAttendanceQueue,
  getCleanupQueue,
  getGpsQueue,
  getNotificationQueue,
} from './jobs.queues';

const logger = pino({ name: 'jobs-scheduler' });

/**
 * Register repeatable/cron jobs defined in docs/backend/background-jobs.md
 * plus midnight auto punch-out (plan Phase 3A).
 * BullMQ v5+ uses upsertJobScheduler instead of Queue.add({ repeat }).
 */
export async function registerScheduledJobs(): Promise<void> {
  if (!isJobsEnabled()) {
    logger.warn('REDIS_URL not set — scheduled jobs not registered');
    return;
  }

  const notificationQueue = getNotificationQueue();
  const gpsQueue = getGpsQueue();
  const cleanupQueue = getCleanupQueue();
  const attendanceQueue = getAttendanceQueue();

  if (notificationQueue) {
    await notificationQueue.upsertJobScheduler(
      'cron-attendance-reminder',
      { pattern: '0 9 * * *' },
      { name: JOB_NAMES.ATTENDANCE_REMINDER, data: {} },
    );
    await notificationQueue.upsertJobScheduler(
      'cron-daily-summary',
      { pattern: '0 20 * * *' },
      { name: JOB_NAMES.DAILY_SUMMARY, data: {} },
    );
  }

  if (gpsQueue) {
    await gpsQueue.upsertJobScheduler(
      'cron-gps-aggregate',
      { pattern: '0 2 * * *' },
      { name: JOB_NAMES.AGGREGATE_DAILY, data: {} },
    );
  }

  if (cleanupQueue) {
    await cleanupQueue.upsertJobScheduler(
      'cron-retention-cleanup',
      { pattern: '0 3 * * *' },
      { name: JOB_NAMES.RETENTION_CLEANUP, data: {} },
    );
    await cleanupQueue.upsertJobScheduler(
      'cron-orphan-images',
      { pattern: '0 4 * * 0' },
      { name: JOB_NAMES.ORPHAN_IMAGES, data: {} },
    );
  }

  if (attendanceQueue) {
    // Hourly — processor filters companies whose local time is midnight.
    await attendanceQueue.upsertJobScheduler(
      'cron-midnight-auto-punch-out',
      { pattern: '0 * * * *' },
      { name: JOB_NAMES.MIDNIGHT_AUTO_PUNCH_OUT, data: {} },
    );
  }

  logger.info('Repeatable BullMQ jobs registered');
}
