import { env } from '@/env';
import type { UserList } from './lists';

const endpoint = `${env.NEXT_PUBLIC_API_URL}/lists`;

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${endpoint}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  if (!response.ok) return null;
  if (response.status === 204) return null;
  return (await response.json()) as T;
}

export function createListOnApi(input: {
  name: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
  games?: unknown[];
}) {
  return request<UserList>('/', { method: 'POST', body: JSON.stringify(input) });
}

export function updateListOnApi(id: string, input: {
  name: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
  games?: unknown[];
}) {
  return request<UserList>(`/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
}
