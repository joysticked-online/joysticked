import { RedisClient } from 'bun';

import { envs } from '../config/envs';

export function createRedis() {
  return new RedisClient(envs.db.REDIS_URL, {
    maxRetries: 3,
    connectionTimeout: 10000
  });
}

export const redis = createRedis();
