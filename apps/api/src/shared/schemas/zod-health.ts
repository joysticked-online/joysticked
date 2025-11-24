import z from 'zod';
import { zDate } from './zod-date';

export const healthStatusSchema = z.enum(['ok', 'error', 'unknown']);

export const healthCheckResultSchema = z.object({
  name: z.string(),
  status: healthStatusSchema,
  responseTime: z.number().optional(),
  error: z.string().optional()
});

export const healthCheckResponseSchema = z.object({
  status: healthStatusSchema,
  timestamp: zDate,
  uptime: z.number(),
  responseTime: z.number(),
  checks: z.array(healthCheckResultSchema),
  message: z.string().optional()
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
