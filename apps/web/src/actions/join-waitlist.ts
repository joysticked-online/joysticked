'use server';

import { api } from '@/lib/api';

export async function joinWaitlist(email: string) {
  return await api.waitlist.join.post({ email });
}
