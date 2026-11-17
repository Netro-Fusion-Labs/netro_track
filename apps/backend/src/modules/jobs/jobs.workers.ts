import { Worker, type Job } from 'bullmq';
import pino from 'pino';
import { getBullmqConnection, isJobsEnabled } from './jobs.connection';
import { JOB_NAMES, QUEUE_NAMES } from './jobs.constants';
import { runAttendanceReminders } from './services/attendance-reminder.service';
import { runAutoPunchOut } from './services/auto-punch-out.service';
import { runGpsDailyAggregation } from './services/gps-aggregate.service';
import { runOrphanImageCleanup } from './services/orphan-images.service';
import { runRetentionCleanup } from './services/retention-cleanup.service';
import { notificationService } from '../notifications/notification.service';

const logger = pino({ name: 'jobs-workers' });
const workers: Worker[] = [];

async function handleNotificationJob(job: Job): Promise<void> {
  switch (job.name) {
    case JOB_NAMES.SEND_PUSH:
      await notificationService.dispatchSendPushJob(job.data as {
        userId: string;
        title: string;
        body: string;
        data?: Record<string, string>;
      });
      return;
    case JOB_NAMES.ATTENDANCE_REMINDER:
      await runAttendanceReminders();
      return;
    case JOB_NAMES.DAILY_SUMMARY:
      logger.info('daily-summary job acknowledged (summary content reserved for V1.1)');
      return;
    default:
      logger.warn({ jobName: job.name }, 'Unknown notification job');
  }
}

async function handleGpsJob(job: Job): Promise<void> {
  if (job.name === JOB_NAMES.AGGREGATE_DAILY) {
    await runGpsDailyAggregation();
  }
}

async function handleCleanupJob(job: Job): Promise<void> {
  if (job.name === JOB_NAMES.RETENTION_CLEANUP) {
    await runRetentionCleanup();
  } else if (job.name === JOB_NAMES.ORPHAN_IMAGES) {
    await runOrphanImageCleanup();
  }
}

async function handleAttendanceJob(job: Job): Promise<void> {
  if (job.name === JOB_NAMES.MIDNIGHT_AUTO_PUNCH_OUT) {
    await runAutoPunchOut();
  }
}

export function startJobWorkers(): void {
  if (!isJobsEnabled()) {
    logger.warn('REDIS_URL not set — BullMQ workers not started');
    return;
  }

  const connection = getBullmqConnection();

  workers.push(
    new Worker(QUEUE_NAMES.NOTIFICATION, handleNotificationJob, {
      connection,
      concurrency: 10,
    }),
    new Worker(QUEUE_NAMES.GPS, handleGpsJob, {
      connection,
      concurrency: 2,
    }),
    new Worker(QUEUE_NAMES.CLEANUP, handleCleanupJob, {
      connection,
      concurrency: 1,
    }),
    new Worker(QUEUE_NAMES.ATTENDANCE, handleAttendanceJob, {
      connection,
      concurrency: 1,
    }),
  );

  for (const worker of workers) {
    worker.on('failed', (job, err) => {
      logger.error({ err, jobId: job?.id, jobName: job?.name }, 'Job failed');
    });
    worker.on('completed', (job) => {
      logger.debug({ jobId: job.id, jobName: job.name }, 'Job completed');
    });
  }

  logger.info({ workerCount: workers.length }, 'BullMQ workers started');
}

export async function stopJobWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  workers.length = 0;
}
