import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'uk'],
  defaultLocale: 'en',
  localePrefix: {
    // English lives at the root ("/", "/my-gifts"); "/en/..." redirects there.
    mode: 'as-needed',
    prefixes: { uk: '/ua' },
  },
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
