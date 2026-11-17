import type { ConnectionOptions } from 'bullmq';

export function isJobsEnabled(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

/**
 * Parse REDIS_URL into BullMQ/ioredis connection options.
 * maxRetriesPerRequest must be null for BullMQ workers.
 */
export function getBullmqConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    throw new Error('REDIS_URL is required to start BullMQ workers');
  }

  const parsed = new URL(url);
  const dbPath = parsed.pathname.replace(/^\//, '');
  const db = dbPath ? Number.parseInt(dbPath, 10) : 0;

  return {
    host: parsed.hostname || '127.0.0.1',
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 6379,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    db: Number.isFinite(db) ? db : 0,
    maxRetriesPerRequest: null,
  };
}
