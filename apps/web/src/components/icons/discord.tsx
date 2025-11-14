import { cn } from '@/lib/utils';

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 22 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
    >
      <path
        d="M21 7V4H20V2H19V1H17V0H14V1H8V0H5V1H3V2H2V4H1V7H0V14H2V15H4V16H6V14H5V13H7V14H8V15H14V14H15V13H17V14H16V16H18V15H20V14H22V7H21ZM8 11H6V10H5V8H6V7H8V8H9V10H8V11ZM17 10H16V11H14V10H13V8H14V7H16V8H17V10Z"
        fill="black"
      />
    </svg>
  );
}
