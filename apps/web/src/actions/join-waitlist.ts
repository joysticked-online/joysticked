'use server';

import { api } from '@/lib/api';

export async function joinWaitlist(email: string) {
  const result = await api.waitlist.join.post({ email });

  if (result.error) {
    return {
      success: false,
      error: result.error.value.message || 'Failed to join waitlist'
    };
  }

  return {
    success: true,
    data: result.data
  };
}
