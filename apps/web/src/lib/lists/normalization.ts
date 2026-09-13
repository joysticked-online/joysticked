export function normalizeListIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function createListSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `lista-${Date.now()}`
  );
}
