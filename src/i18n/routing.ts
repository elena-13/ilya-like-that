import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // `uk` is the ISO 639-1 code for Ukrainian (used for <html lang>, Payload, SEO).
  // Visitors only ever see "UA": the URL prefix below and the switcher label.
  locales: ['en', 'uk'],
  defaultLocale: 'en',
  localePrefix: {
    // English lives at the root ("/", "/my-gifts"); "/en/..." redirects there.
    mode: 'as-needed',
    prefixes: { uk: '/ua' },
  },
  // "/" always means English, whatever the browser's Accept-Language says.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
