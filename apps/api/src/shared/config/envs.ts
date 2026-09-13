import { z } from 'zod';

export const envs = {
  app: loadAppEnvs(),
  db: loadDbEnvs(),
  services: loadServicesEnvs(),
  auth: loadAuthEnvs()
};

function loadAppEnvs() {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
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
    RESEND_API_KEY: z.string().optional().default(''),
    RESEND_WAITLIST_AUDIENCE_ID: z.string().optional().default(''),
    EMAIL_DOMAIN: z.string().optional().default('delivered@resend.dev'),
    TWITCH_CLIENT_ID: z.string().optional(),
    TWITCH_CLIENT_SECRET: z.string().optional(),
    STEAM_API_KEY: z.string().optional()
  });

  return schema.parse(process.env);
}

function loadAuthEnvs() {
  const schema = z.object({
    SESSION_SECRET: z.string().min(32),
    AUTH_CALLBACK_URL: z.url().default('http://localhost:8080'),
    // OAuth provider credentials — required in Phase 3, optional here
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional()
  });

  return schema.parse(process.env);
}
