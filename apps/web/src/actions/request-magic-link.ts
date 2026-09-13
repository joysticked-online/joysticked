'use server';

import { api } from '@/lib/api';

export async function requestMagicLink(email: string) {
  try {
    const result = await api.auth['magic-link'].post({ email });

    if (result.error) {
      const errorMsg =
        typeof result.error.value === 'object' &&
        result.error.value &&
        'message' in result.error.value
          ? String((result.error.value as { message?: string }).message)
          : 'Failed to send magic link. Please check your email and try again.';

      return {
        success: false,
        error: errorMsg
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (_err) {
    return {
      success: false,
      error: 'Could not connect to the API server. Please try again later.'
    };
  }
}
