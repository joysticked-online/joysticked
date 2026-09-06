'use server';

import { cookies } from 'next/headers';
import { api } from '@/lib/api';

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    await api.auth.logout.post(undefined, {
      headers: sessionCookie ? { cookie: `session=${sessionCookie}` } : undefined
    });

    cookieStore.delete('session');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to log out' };
  }
}
