/** Build an internal auth return URL without allowing arbitrary destinations. */
export function authHref(returnPath: string): string {
  const path = returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/home';
  return `/auth?redirect=${encodeURIComponent(path)}`;
}

/** Normalize a query-provided return path to a same-origin relative URL. */
export function safeReturnPath(value: string | null | undefined, fallback = '/home'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}
