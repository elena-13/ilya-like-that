import { EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

// Marks an item only admins can see.
export function PrivateBadge({ className }: { className?: string }) {
  const t = useTranslations('wishlist');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-2.5 py-1 font-secondary text-xs text-navy',
        className,
      )}
    >
      <EyeOff className="h-3.5 w-3.5" />
      {t('private')}
    </span>
  );
}
