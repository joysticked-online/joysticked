import { z } from 'zod';

export const envs = {
  app: loadAppEnvs(),
  db: loadDbEnvs()
};

function loadAppEnvs() {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod']).default('dev'),
    PORT: z.coerce.number().default(3333),
    RESEND_API_KEY: z.string()
  });

  return schema.parse(Bun.env);
}

function loadDbEnvs() {
  const schema = z.object({
    DATABASE_URL: z.url()
  });

  return schema.parse(Bun.env);
}
