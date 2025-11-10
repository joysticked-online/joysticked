'use server';

import { api } from '@/lib/api';

export async function joinWaitlist(email: string) {
  return api.waitlist.join.post({ email });
}
