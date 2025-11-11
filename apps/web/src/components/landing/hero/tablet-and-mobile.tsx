import { Illustrations } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LANDING_PAGE_COPY } from '@/constants/landing-page-copy';

export function TabletAndMobileHero() {
  return (
    <div className="relative flex min-h-screen flex-col items-start justify-center gap-6 overflow-hidden md:items-center">
      <div className="absolute top-10 flex w-full flex-row items-center justify-between">
        <Illustrations.Clouds />
        <Illustrations.Clouds />
      </div>

      <div className="relative z-10 flex w-fit flex-col gap-6 max-md:pl-10">
        <div className="flex flex-col items-start gap-2.5 md:items-center">
          <h1 className="w-fit max-w-[250px] font-redaction text-3xl md:max-w-xl md:text-center md:text-5xl">
            {LANDING_PAGE_COPY.TITLE}
          </h1>

          <p className="max-w-md font-geist-sans font-medium text-muted-foreground text-xs max-md:max-w-xs md:text-center md:text-sm">
            {LANDING_PAGE_COPY.SUBTITLE}
          </p>
        </div>

        <div className="z-10 flex flex-col items-start gap-6 md:items-center">
          <Input
            placeholder="kratos@godofwar.com"
            className="h-8 w-60 bg-neutral-800 max-lg:rounded-lg"
          />
          <Button
            variant="default"
            className="h-8 w-1/2 font-geist-sans font-semibold max-md:rounded-lg md:h-fit md:w-1/3 md:font-bold"
          >
            Join our waitlist
          </Button>
        </div>
      </div>

      <div className="w-full">
        <div>
          <Illustrations.StoppedElephantTwo className="absolute right-8 bottom-[345px] md:right-40" />
          <Illustrations.TopFloor className="-right-32 absolute bottom-80 md:right-0" />
        </div>

        <div className="absolute bottom-0 w-full">
          <Illustrations.RightFloor className="w-full scale-125" />
          <Illustrations.Ladder className="absolute right-0 bottom-18" />
        </div>
      </div>
    </div>
  );
}
