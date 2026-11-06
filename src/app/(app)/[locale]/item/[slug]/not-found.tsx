import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { paths } from '@/lib/paths';

export default function NotFound() {
  const t = useTranslations('item');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold">{t('notFoundHeading')}</h2>
      <p className="text-gray-600">{t('notFoundText')}</p>
      <Link href={paths.home()} className="px-6 py-2 bg-black text-white rounded-lg">
        {t('backToWishlist')}
      </Link>
    </div>
  );
}
