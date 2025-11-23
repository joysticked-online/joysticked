import { Elysia } from 'elysia';
import { db } from '../database';
import { redis } from '../providers/redis';
import {
  type HealthCheckResponse,
  type HealthCheckResult,
  type HealthStatus,
  healthCheckResponseSchema
} from '../schemas/zod-date';

export const healthCheck = new Elysia().get(
  '/health',
  async ({ status }) => {
    const checks: Record<string, HealthCheckResult> = {};
    let overallStatus: HealthStatus = 'ok';
    const startTime = Date.now();

    const dbStartTime = Date.now();

    try {
      await db.execute('SELECT 1');
      const dbResponseTime = Date.now() - dbStartTime;
      checks.database = {
        name: 'database',
        status: 'ok',
        responseTime: dbResponseTime
      };
    } catch (error) {
      checks.database = {
        name: 'database',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      overallStatus = 'error';
    }

    const redisStartTime = Date.now();

    try {
      const result = await redis.ping();
      const redisResponseTime = Date.now() - redisStartTime;

      const isHealthy = result === 'PONG' || result === true;

      checks.redis = {
        name: 'redis',
        status: isHealthy ? 'ok' : 'error',
        responseTime: redisResponseTime,
        ...(!isHealthy && { error: 'Unexpected ping response' })
      };

      if (!isHealthy) {
        overallStatus = 'error';
      }
    } catch (error) {
      checks.redis = {
        name: 'redis',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknow Error'
      };
      overallStatus = 'error';
    }

    const totalReposponseTime = Date.now() - startTime;

    checks.api = {
      name: 'api',
      status: 'ok',
      responseTime: totalReposponseTime
    };

    const httpStatus = overallStatus === 'ok' ? 200 : 503;

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalReposponseTime,
      checks: Object.values(checks),
      ...(overallStatus === 'error' && {
        message: 'One or more services are unhealthy'
      })
    };

    return status(httpStatus, response);
  },
  {
    response: {
      200: healthCheckResponseSchema,
      503: healthCheckResponseSchema
    }
  }
);
