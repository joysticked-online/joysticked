import type { ZodType } from 'zod';

export function overrideJSONSchema<T extends ZodType>(
  schema: T,
  toJSONSchema: () => unknown | undefined
): T {
  const result = Object.create(Object.getPrototypeOf(schema));
  Object.assign(result, schema);

  result._zod = { ...schema._zod, toJSONSchema };

  return result;
}
