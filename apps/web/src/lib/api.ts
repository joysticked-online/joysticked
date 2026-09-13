import { treaty } from '@elysiajs/eden';
import type { App } from '@joysticked/api';
import { env } from '@/env';

const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return env.NEXT_PUBLIC_API_URL;
};

export const api = treaty<App>(getApiUrl());
