'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { TopNavContent } from './top-nav-content';

function TopNavWithParams() {
  const searchParams = useSearchParams();
  return <TopNavContent searchParams={searchParams} />;
}

export function TopNav() {
  return (
    <Suspense fallback={<TopNavContent searchParams={null} />}>
      <TopNavWithParams />
    </Suspense>
  );
}
