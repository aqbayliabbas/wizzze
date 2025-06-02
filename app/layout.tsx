import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CreatorConnect - Brand & UGC Creator Marketplace',
  description: 'Connect brands with UGC creators for authentic content collaborations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}