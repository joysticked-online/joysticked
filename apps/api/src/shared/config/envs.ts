import { z } from 'zod';

export const envs = {
  app: loadAppEnvs(),
  db: loadDbEnvs(),
  services: loadServicesEnvs()
};

function loadAppEnvs() {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod']).default('dev'),
    PORT: z.coerce.number().default(3333)
  });

  return schema.parse(process.env);
}

function loadDbEnvs() {
  const schema = z.object({
    DATABASE_URL: z.url()
  });

  return schema.parse(process.env);
}

function loadServicesEnvs() {
  const schema = z.object({
    RESEND_API_KEY: z.string(),
    EMAIL_DOMAIN: z.string()
  });

  return schema.parse(process.env);
}
