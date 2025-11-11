import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { envs } from '../config/envs';
import * as schemas from './schemas';

let queryClient: ReturnType<typeof postgres> | null = null;

export function getDatabase(options?: { standalone?: boolean; maxConnections?: number }) {
  const config = {
    max: options?.maxConnections ?? 5000,
    idle_timeout: 20,
    connect_timeout: 10
  };

  let sql: ReturnType<typeof postgres>;

  // Standalone ignores the singleton, useful for scripts accessing databases from different environments
  if (options?.standalone) {
    sql = postgres(envs.db.DATABASE_URL, config);
  } else {
    // Reuse the same connection pool (singleton pattern)
    sql = queryClient = queryClient || postgres(envs.db.DATABASE_URL, config);
  }

  return drizzle(sql, { logger: envs.app.NODE_ENV !== 'prod', schema: schemas });
}

export const db = getDatabase();

export type Database = ReturnType<typeof getDatabase>;
