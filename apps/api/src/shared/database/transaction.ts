import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import type { ExtractTablesWithRelations } from 'drizzle-orm/relations';
import type { Database } from './index';
import type * as schema from './schemas';

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export async function executeTransaction<T>(
  db: Database,
  callback: (tx: Transaction) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}
