/**
 * Checks if array has duplicates - recursive validation
 */
export type HasDuplicates<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends Rest[number]
    ? true
    : HasDuplicates<Rest>
  : false;
