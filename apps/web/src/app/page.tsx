import { Illustrations } from '@/components/illustrations';
import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-hidden">
      <div className="absolute top-15">
        <Logos.Joysticked />
      </div>

      <div className="absolute bottom-0 flex max-w-screen flex-row items-end">
        <Illustrations.Elephant />

        <div className="relative">
          <Illustrations.HalfPortal className="z-0" />
          <Illustrations.Flower className="absolute bottom-0 z-1" />
        </div>

        <div className="relative flex items-end">
          <Illustrations.LeftFloor className="z-0" />
          <Illustrations.Pipe className="absolute bottom-0 z-1 translate-x-[650%]" />
          <Illustrations.RightFloor className="z-0" />

          <div className="absolute right-10 bottom-0 flex flex-col">
            <Illustrations.FlowerThree className="-translate-x-1/3 mb-12 rotate-[-10deg]" />
            <Illustrations.FlowerTwo />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <h1 className="w-fit max-w-4xl text-center font-redaction text-7xl">
          Track, review and share every game you play
        </h1>

        <p className="max-w-2xl text-center font-geist-sans font-medium text-muted-foreground text-xl">
          Unlock a new way to track your gaming experiences, connect with friends, and find out
          what’s trending.
        </p>
      </div>

      <div className="z-10 flex flex-col items-center gap-7">
        <Input placeholder="kratos@godofwar.com" className="w-80 bg-neutral-800" />
        <Button variant="default" className="w-2/3 py-1 font-bold font-geist-sans">
          Join our waitlist
        </Button>
      </div>
    </div>
  );
}
