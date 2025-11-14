import { z } from 'zod';

export const envs = {
  app: loadAppEnvs(),
  db: loadDbEnvs(),
  services: loadServicesEnvs(),
  auth: loadAuthEnvs(),
};

function loadAppEnvs() {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod']).default('dev'),
    PORT: z.coerce.number().default(8080),
    CLIENT_URL: z.url().default('http://localhost:3000')
  });

  return schema.parse(process.env);
}

function loadDbEnvs() {
  const schema = z.object({
    DATABASE_URL: z.url(),
    REDIS_URL: z.url()
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


function loadAuthEnvs() {
  const schema = z.object({
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url().default('http://localhost:8080'),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string()
  });
  return schema.parse(process.env);
}
