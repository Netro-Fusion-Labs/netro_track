import pino from 'pino';
import { isJobsEnabled } from './jobs.connection';
import { closeAllQueues } from './jobs.queues';
import { registerScheduledJobs } from './jobs.scheduler';
import { startJobWorkers, stopJobWorkers } from './jobs.workers';

const logger = pino({ name: 'jobs-lifecycle' });

export async function startBackgroundJobs(): Promise<void> {
  if (!isJobsEnabled()) {
    logger.warn('REDIS_URL not set — background jobs disabled (API continues without workers)');
    return;
  }

  try {
    startJobWorkers();
    await registerScheduledJobs();
    logger.info('Background job subsystem started');
  } catch (err) {
    logger.error({ err }, 'Failed to start background jobs — continuing without workers');
  }
}

export async function stopBackgroundJobs(): Promise<void> {
  if (!isJobsEnabled()) return;
  try {
    await stopJobWorkers();
    await closeAllQueues();
    logger.info('Background job subsystem stopped');
  } catch (err) {
    logger.error({ err }, 'Error while stopping background jobs');
  }
}
