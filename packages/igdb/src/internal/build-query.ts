export interface QueryOptions<T extends readonly unknown[]> {
  fields: T;
  where?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
  exclude?: T;
}

export function buildQuery<T extends readonly unknown[]>(options: QueryOptions<T>): string {
  const parts: string[] = [];

  parts.push(`fields ${options.fields.join(',')};`);

  if (options.where) {
    parts.push(`where ${options.where};`);
  }

  if (options.limit !== undefined) {
    parts.push(`limit ${options.limit};`);
  }

  if (options.offset !== undefined) {
    parts.push(`offset ${options.offset};`);
  }

  if (options.sort) {
    parts.push(`sort ${options.sort};`);
  }

  if (options.search) {
    parts.push(`search "${options.search}";`);
  }

  if (options.exclude && options.exclude.length > 0) {
    parts.push(`exclude ${options.exclude.join(',')};`);
  }

  return parts.join(' ');
}
