import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2.5">
          <h1 className="w-fit max-w-4xl text-center font-redaction text-7xl">
            Track, review and share every game you play
          </h1>
          <p className="max-w-2xl text-center font-geist-sans font-medium text-muted-foreground text-xl">
            Unlock a new way to track your gaming experiences, connect with friends, and find out
            what’s trending.
          </p>
        </div>
        <div className="flex flex-col items-center gap-7">
          <Input placeholder="kratos@godofwar.com" className="w-80" />
          <Button variant="default" className="w-2/3 font-bold font-geist-sans">
            Join our waitlist
          </Button>
        </div>
      </div>
    </div>
  );
}
