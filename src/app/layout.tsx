import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';

import { cn } from '@/lib/utils';
import AuthClientProvider from '@/components/auth/AuthClientProvider';
import Header from '@/widgets/Header/Header';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Ilya Like That!',
  description: "Ilya's Wishlist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col',
          fontSans.variable
        )}
      >
        <AuthClientProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        </AuthClientProvider>
      </body>
    </html>
  );
}
