import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';

import { Providers } from '@/components/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const redaction = localFont({
  src: '../../public/redaction.otf',
  variable: '--font-redaction'
});

export const metadata: Metadata = {
  title: 'Joysticked',
  description: 'Play, rate & discover your next obsession',
  openGraph: {
    images: [
      {
        url: '/opengraph.png',
        width: 639,
        height: 415,
        alt: 'Joysticked Open Graph Image'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Joysticked',
    description: 'Play, rate & discover your next obsession',
    images: [
      {
        url: '/opengraph.png',
        width: 639,
        height: 415,
        alt: 'Joysticked Open Graph Image'
      }
    ],
    creator: '@usejoysticked'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://assets.onedollarstats.com/stonks.js" />
      </head>
      <body className={`${geistSans.variable} ${redaction.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
