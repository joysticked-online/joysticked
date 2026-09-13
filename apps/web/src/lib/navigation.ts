/** Build an internal auth return URL without allowing arbitrary destinations. */
export function authHref(returnPath: string): string {
  const path = isSafeReturnPath(returnPath) ? returnPath : '/home';
  return `/auth?redirect=${encodeURIComponent(path)}`;
}

/** Normalize a query-provided return path to a same-origin relative URL. */
export function safeReturnPath(value: string | null | undefined, fallback = '/home'): string {
  if (!value || !isSafeReturnPath(value)) return fallback;
  return value;
}

function isSafeReturnPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
}
