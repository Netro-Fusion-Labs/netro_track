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
    process.env.REDIS_URL = 'redis://:secret@127.0.0.1:6380/2';
    expect(isJobsEnabled()).toBe(true);
    expect(getBullmqConnection()).toEqual({
      host: '127.0.0.1',
      port: 6380,
      password: 'secret',
      db: 2,
      maxRetriesPerRequest: null,
    });
  });
});
