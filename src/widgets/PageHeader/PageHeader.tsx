import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { BrandLink } from '@/widgets/Header/parts/BrandLink';
import { LanguageSwitcher } from '@/widgets/LanguageSwitcher/LanguageSwitcher';
import { paths } from '@/lib/paths';

type PageHeaderProps = {
  /** Where the back button points. Defaults to the wishlist home page. */
  backHref?: string;
  /** Label shown next to the back arrow. Defaults to "Back to list" in the current language. */
  backLabel?: string;
};

/**
 * Reusable header for inner pages (e.g. the item page).
 * Shows a back button on the left, the language switcher and the brand on the right.
 */
export default function PageHeader({ backHref = paths.home(), backLabel }: PageHeaderProps) {
  const t = useTranslations('nav');
  const label = backLabel ?? t('backToList');

  return (
    // Solid background: a backdrop blur under a 95% opaque header was barely
    // visible but re-blurred the page on every scroll frame.
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link href={backHref} aria-label={label}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <BrandLink />
          </div>
        </div>
      </div>
    </header>
  );
}
