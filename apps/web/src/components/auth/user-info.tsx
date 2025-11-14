'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth-client';

export function UserInfo() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {session.user.image && (
        <img src={session.user.image} alt={session.user.name} className="h-10 w-10 rounded-full" />
      )}
      <div>
        <p className="font-semibold">{session.user.name}</p>
        <p className="text-gray-500 text-sm">{session.user.email}</p>
      </div>
      <Button onClick={() => signOut()} variant="outline">
        To go out
      </Button>
    </div>
  );
}
