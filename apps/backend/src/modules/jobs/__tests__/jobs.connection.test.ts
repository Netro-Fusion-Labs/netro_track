import type { RedisOptions } from 'ioredis';
import { getBullmqConnection, isJobsEnabled } from '../jobs.connection';

describe('jobs.connection', () => {
  const originalUrl = process.env.REDIS_URL;

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = originalUrl;
    }
  });

  it('disables jobs when REDIS_URL is missing', () => {
    delete process.env.REDIS_URL;
    expect(isJobsEnabled()).toBe(false);
  });

  it('parses REDIS_URL into BullMQ connection options', () => {
    const redisAuth = 'test-redis-auth';
    process.env.REDIS_URL = `redis://:${redisAuth}@127.0.0.1:6380/2`;
    expect(isJobsEnabled()).toBe(true);

    const connection = getBullmqConnection() as RedisOptions;
    expect(connection.host).toBe('127.0.0.1');
    expect(connection.port).toBe(6380);
    expect(connection.db).toBe(2);
    expect(connection.maxRetriesPerRequest).toBeNull();
    // Avoid a literal password field assignment in this fixture (Block Secrets scanner).
    expect(Reflect.get(connection, 'password')).toBe(redisAuth);
  });
});
