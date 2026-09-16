import type { Metadata } from 'next';

import AuthClientProvider from '@/components/auth/AuthClientProvider';
import Header from '@/widgets/Header/Header';

import './globals.css';
import { neurath, facultyGlyphic } from './fonts';

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
    <html lang="en" className={`${neurath.variable} ${facultyGlyphic.variable}`}>
      <body>
        <AuthClientProvider>
          {/* <Header /> */}
          {children}
        </AuthClientProvider>
      </body>
    </html>
  );
}
