import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BrandLink } from '@/widgets/Header/parts/BrandLink';
import { paths } from '@/lib/paths';

type PageHeaderProps = {
  /** Where the back button points. Defaults to the wishlist home page. */
  backHref?: string;
  /** Label shown next to the back arrow. */
  backLabel?: string;
};

/**
 * Reusable header for inner pages (e.g. the item page).
 * Shows a back button on the left and the brand on the right.
 */
export default function PageHeader({
  backHref = paths.home(),
  backLabel = 'Back to list',
}: PageHeaderProps) {
  return (
    // Solid background: a backdrop blur under a 95% opaque header was barely
    // visible but re-blurred the page on every scroll frame.
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link href={backHref} aria-label={backLabel}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          </Button>

          <BrandLink />
        </div>
      </div>
    </header>
  );
}
