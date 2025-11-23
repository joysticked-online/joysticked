import { z } from 'zod';

import { overrideJSONSchema } from '../utils/override-json-schema';

const datetime = z.union([z.iso.datetime(), z.date()]);

export const zDate = overrideJSONSchema(
  z.codec(datetime, datetime, {
    decode: (isoString) => new Date(isoString),
    encode: (date) => new Date(date).toISOString()
  }),
  () => z.toJSONSchema(z.iso.datetime())
);

export const healthStatusSchema = z.enum(['ok', 'error', 'unknown']);

export const healthCheckResultSchema = z.object({
  name: z.string(),
  status: healthStatusSchema,
  responseTime: z.number().optional(),
  error: z.string().optional()
});

export const healthCheckResponseSchema = z.object({
  status: healthStatusSchema,
  timestamp: z.string().datetime(),
  uptime: z.number(),
  responseTime: z.number(),
  checks: z.array(healthCheckResultSchema),
  message: z.string().optional()
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
