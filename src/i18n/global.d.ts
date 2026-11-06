import type messages from '../../messages/en.json';
import type { routing } from './routing';

// Typed keys: a missing or misspelled translation key fails `tsc`.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
