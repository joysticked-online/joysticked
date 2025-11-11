import { defineConfig } from 'drizzle-kit';
import { envs } from './src/shared/config/envs';

export default defineConfig({
  out: './drizzle',
  schema: ['./src/shared/database/schemas/index.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: envs.db.DATABASE_URL
  },
  migrations: {
    prefix: 'timestamp'
  },
  verbose: true,
  strict: true
});
