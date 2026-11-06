'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { getPathname, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

// Visitors see "UA"; the locale code stays the ISO `uk`.
const LABELS: Record<(typeof routing.locales)[number], string> = {
  en: 'EN',
  uk: 'UA',
};

// EN | UA toggle. Real links (not buttons), so each language version of the
// current page is a crawlable URL and works without JavaScript.
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav
      aria-label={t('language')}
      className={cn(
        'inline-flex items-center rounded-full border-2 border-navy p-0.5 font-secondary text-sm text-navy',
        className,
      )}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            // getPathname gives "/item/x" for EN and "/ua/item/x" for UA. The
            // next-intl Link would write "/en/item/x" for EN, costing a redirect.
            href={getPathname({ href: pathname, locale: l })}
            lang={l}
            hrefLang={l}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-full px-3 py-1 transition-colors',
              active ? 'bg-navy text-white' : 'hover:bg-navy/10',
            )}
          >
            {LABELS[l]}
          </Link>
        );
      })}
    </nav>
  );
}
