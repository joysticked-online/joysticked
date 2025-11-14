'use client';

import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';
import { Icons } from '../icons';

export function SignInButtons() {
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: 'http://localhost:3000/profile'
    });
  };

  const handleDiscordSignIn = async () => {
    await signIn.social({
      provider: 'discord',
      callbackURL: 'http://localhost:3000/profile'
    });
  };

  return (
    <div className="relative z-50 flex w-[220px] flex-col gap-4">
      <Button
        onClick={handleGoogleSignIn}
        variant="default"
        type="button"
        className="relative z-50 h-8.5 gap-3 rounded-[14px] text-center"
      >
        <Icons.GoogleIcon />
        <span className="font-geist-sans font-semibold text-xl">Google</span>
      </Button>

      <Button
        onClick={handleDiscordSignIn}
        variant="default"
        type="button"
        className="relative z-50 h-8.5 gap-3 rounded-[14px] text-center"
      >
        <Icons.DiscordIcon />
        <span className="font-geist-sans font-semibold text-xl">Discord</span>
      </Button>
    </div>
  );
}
