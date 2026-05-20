import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/src/components/ui/Providers';
import { TransitionProvider } from '@/src/context/TransitionContext';
import { TransitionOverlay } from '@/src/components/TransitionOverlay';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Multi-Agent Research',
  description: 'AI-powered research platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <TransitionProvider>
          <TransitionOverlay />
          <Providers>{children}</Providers>
        </TransitionProvider>
      </body>
    </html>
  );
}
