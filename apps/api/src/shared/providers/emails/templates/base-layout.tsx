import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Tailwind,
  Text
} from '@react-email/components';
import type { ReactNode } from 'react';

type BaseLayoutProps = {
  preview: ReactNode;
  children: ReactNode;
};

export const BRAND = {
  colors: {
    background: '#171717',
    text: '#fafafa'
  },
  assets: {
    logo: {
      url: 'https://i.imgur.com/Hu0gxcp.png',
      alt: 'Joysticked Logo'
    }
  }
};

export default function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist"
          webFont={{
            url: 'https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8gMEwSGFWNOITddY4.woff2',
            format: 'woff2'
          }}
          fallbackFontFamily="sans-serif"
        />
      </Head>
      <Tailwind config={pixelBasedPreset}>
        <Body className="m-0 bg-neutral-900 p-0 text-center font-['Geist'] text-[#fafafa]">
          {preview}
          <Container className="mx-auto max-w-[600px] p-5">{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailHeader({ url, alt }: { url: string; alt: string }) {
  return <Img src={url} alt={alt} className="mx-auto w-full max-w-[302px]" />;
}

export function WaitlistEmailFooter({ clientUrl, email }: { clientUrl: string; email: string }) {
  return (
    <Container className="mt-auto w-full p-5">
      <Img src={BRAND.assets.logo.url} alt={BRAND.assets.logo.alt} className="mx-auto mb-4 w-12" />
      <Text className="m-0 mt-20 text-center font-light text-[10px] leading-tight">
        You're receiving this email because you signed <br /> up on Joysticked waitlist.{' '}
        <Link
          href={`${clientUrl}/waitlist/unsubscribe?email=${email}`}
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
