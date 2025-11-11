import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

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
  description:
    'Track, rate, and share your gaming journey. joysticked is an open-source platform for game enthusiasts to log their experiences, discover new titles, and connect with fellow players.',
  openGraph: {
    images: [
      {
        url: '/opengraph.png',
        width: 639,
        height: 415,
        alt: 'Joysticked Open Graph Image'
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${redaction.variable} antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
