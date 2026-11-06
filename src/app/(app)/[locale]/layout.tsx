import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import AuthClientProvider from '@/components/auth/AuthClientProvider';
import { StarShowerHost } from '@/features/wishlist/components/StarShowerHost';
import { routing } from '@/i18n/routing';

import '../globals.css';
import { neurath, facultyGlyphic } from '../fonts';

export const metadata: Metadata = {
  title: 'Ilya Like That!',
  description: "Ilya's Wishlist",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${neurath.variable} ${facultyGlyphic.variable}`}>
      <body>
        <NextIntlClientProvider>
          <AuthClientProvider>
            {children}
          </AuthClientProvider>
          <StarShowerHost />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
