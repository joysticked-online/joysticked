const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRIES = 2;

type RetryPolicy = { timeoutMs?: number; retries?: number; baseDelayMs?: number };

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function retryAfterMs(response: Response): number | null {
  const value = response.headers.get('retry-after');
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.min(seconds * 1000, 10_000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, Math.min(date - Date.now(), 10_000)) : null;
}

export async function externalFetch(input: string | URL | Request, init: RequestInit = {}, policy: RetryPolicy = {}): Promise<Response> {
  const timeoutMs = policy.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = policy.retries ?? DEFAULT_RETRIES;
  const baseDelayMs = policy.baseDelayMs ?? 250;

  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    init.signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if (!isRetryableStatus(response.status) || attempt >= retries) return response;
      const delay = retryAfterMs(response) ?? Math.min(baseDelayMs * 2 ** attempt, 4_000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt >= retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.min(baseDelayMs * 2 ** attempt, 4_000)));
    } finally {
      clearTimeout(timeout);
      init.signal?.removeEventListener('abort', onAbort);
    }
  }
}
