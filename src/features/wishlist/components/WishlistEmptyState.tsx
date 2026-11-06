import { useTranslations } from 'next-intl';

export function WishlistEmptyState() {
  const t = useTranslations('wishlist');

  return (
    <div className="mt-10 rounded-2xl border border-dashed border-gray-300 p-10 text-center bg-white/50">
      <h3 className="text-lg font-semibold text-gray-900">{t('emptyTitle')}</h3>
      <p className="mt-1 text-gray-500">{t('emptyText')}</p>
    </div>
  );
}
