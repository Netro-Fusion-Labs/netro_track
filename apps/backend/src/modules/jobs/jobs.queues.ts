import { Queue, type JobsOptions } from 'bullmq';
import { getBullmqConnection, isJobsEnabled } from './jobs.connection';
import { JOB_NAMES, QUEUE_NAMES } from './jobs.constants';

const queues = new Map<string, Queue>();

function getQueue(name: string): Queue | null {
  if (!isJobsEnabled()) return null;
  const existing = queues.get(name);
  if (existing) return existing;
  const queue = new Queue(name, { connection: getBullmqConnection() });
  queues.set(name, queue);
  return queue;
}

export function getNotificationQueue(): Queue | null {
  return getQueue(QUEUE_NAMES.NOTIFICATION);
}

export function getGpsQueue(): Queue | null {
  return getQueue(QUEUE_NAMES.GPS);
}

export function getCleanupQueue(): Queue | null {
  return getQueue(QUEUE_NAMES.CLEANUP);
}

export function getAttendanceQueue(): Queue | null {
  return getQueue(QUEUE_NAMES.ATTENDANCE);
}

export async function enqueueSendPush(
  data: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  },
  opts?: JobsOptions,
): Promise<void> {
  const queue = getNotificationQueue();
  if (!queue) return;
  await queue.add(JOB_NAMES.SEND_PUSH, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
    ...opts,
  });
}

export async function closeAllQueues(): Promise<void> {
  const closing = [...queues.values()].map((q) => q.close());
  queues.clear();
  await Promise.all(closing);
}
