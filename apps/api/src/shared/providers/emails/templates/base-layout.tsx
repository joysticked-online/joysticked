import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Tailwind,
  Text
} from '@react-email/components';
import type { ReactNode } from 'react';
import { envs } from '../../../config/envs';

type BaseLayoutProps = {
  preview: ReactNode;
  children: ReactNode;
};

export const BRAND = {
  colors: {
    background: '#171717',
    text: '#fafafa'
  },
  fonts: {
    main: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: 'Redaction 70, Georgia, serif'
  },
  assets: {
    header: {
      url: 'https://i.imgur.com/Jnc840u.png',
      alt: 'Joysticked Clouds'
    },
    logo: {
      url: 'https://i.imgur.com/Hu0gxcp.png',
      alt: 'Joysticked Logo'
    }
  }
};

export default function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Tailwind config={pixelBasedPreset}>
        <Body className="m-0 bg-neutral-900 p-0 text-center font-['Geist'] text-[#fafafa]">
          {preview}
          <Container className="mx-auto max-w-[600px] p-5">{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailHeader({ children }: { children: ReactNode }) {
  return (
    <Container className="mb-12">
      <Container className="relative h-[200px]">
        <Img
          src={BRAND.assets.header.url}
          alt={BRAND.assets.header.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Text className="relative z-10 m-0 pt-[75px] font-['Redaction_70'] font-bold text-xl">
          {children}
        </Text>
      </Container>
    </Container>
  );
}

export function WaitlistEmailFooter() {
  return (
    <Container className="mt-auto w-full p-5">
      <Img src={BRAND.assets.logo.url} alt={BRAND.assets.logo.alt} className="mx-auto mb-4 w-12" />
      <Text className="m-0 mt-20 text-center font-light text-[10px] leading-tight">
        You're receiving this email because you signed <br /> up on Joysticked waitlist.{' '}
        <Link
          href={`https://${envs.app.CLIENT_URL}/unsubscribe`}
          className="font-normal text-[#fafafa] underline underline-offset-2"
        >
          Unsubscribe
        </Link>
        .
      </Text>
    </Container>
  );
}

export const textStyles = {
  semibold: 'font-semibold text-[10px] leading-tight mb-4',
  light: 'font-light text-[10px] leading-tight mb-4'
};
