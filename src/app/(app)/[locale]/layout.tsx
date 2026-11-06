import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import AuthClientProvider from '@/components/auth/AuthClientProvider';
import { StarShowerHost } from '@/features/wishlist/components/StarShowerHost';
import { routing } from '@/i18n/routing';

import '../globals.css';
import { neurath, facultyGlyphic } from '../fonts';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return { title: t('title'), description: t('description') };
}

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

  // suppressHydrationWarning: browser extensions (e.g. LanguageTool's
  // data-lt-installed) add attributes to <html> before React hydrates.
  return (
    <html
      lang={locale}
      className={`${neurath.variable} ${facultyGlyphic.variable}`}
      suppressHydrationWarning
    >
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
