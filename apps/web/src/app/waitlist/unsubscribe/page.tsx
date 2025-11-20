'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Illustrations } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const opacitySequence = [50, 100];

function UnsubscribeContent() {
  const [opacityIndex, setOpacityIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [id] = useQueryState('id');
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacityIndex((prev) => (prev + 1) % opacitySequence.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted && !id) router.push('/');

  const { data, isPending } = useQuery({
    queryKey: ['unsubscribe', id],
    enabled: !!id || !isMounted,
    async queryFn() {
      return await api.waitlist['join-date'].get({ query: { id: id! } });
    }
  });

  const { mutate: burryMyWaitlistSpot } = useMutation({
    async mutationFn() {
      const { data, error } = await api.waitlist.unsubscribe.post({ id: id! });

      if (error) {
        throw new Error(error.value.message);
      }

      return data;
    },
    onSuccess() {
      toast.success('You have been unsubscribed!');
      router.push('/');
    },
    onError() {
      toast.error('Failed to unsubscribe!');
    }
  });

  if (!isMounted || isPending || !data?.data) return null;

  function rescureMySpot() {
    toast.success('Your spot has been resurrected!');
    router.push('/');
    return;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden">
      <div className="flex gap-6 text-neutral-800">
        <Illustrations.HalfHeart rightSideOpacity={opacitySequence[opacityIndex] / 100} />
        <Illustrations.BrokenHeart opacity={opacitySequence[opacityIndex] / 100} />
        <Illustrations.BrokenHeart opacity={opacitySequence[opacityIndex] / 100} />
      </div>

      <div className="flex flex-col items-center justify-center gap-7">
        <div className="flex flex-col gap-7">
          <h1 className="text-center font-redaction text-6xl">
            DEAD AND BURIED.
            <br />
            {formatDistanceToNow(data?.data?.joinDate).toUpperCase()} WASTED
          </h1>
          <p className="text-center font-light text-muted-foreground">
            Your spot is about to be laid to rest, yet that half-heart still beats.{' '}
            <span className="font-semibold text-neutral-300">
              Unsubscribe and your place in line <br /> will be buried forever
            </span>
            . Are you ready to hold the funeral?
          </p>
        </div>

        <div className="flex gap-4">
          <Button className="w-fit" variant="outline" onClick={rescureMySpot}>
            Resurrect my spot
          </Button>
          <Button className="w-fit" onClick={() => burryMyWaitlistSpot()}>
            Bury my waitlist spot
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribeFromWaitlistPage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeContent />
    </Suspense>
  );
}
