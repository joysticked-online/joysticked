'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserInfo } from '@/components/auth/user-info';
import { useSession } from '@/lib/auth-client';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-8 font-bold text-3xl">Profile</h1>
      <UserInfo />
    </div>
  );
}
