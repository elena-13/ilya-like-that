'use client';

import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { paths } from '@/lib/paths';

export function BrandLink() {
  return (
    <Link href={paths.home()} className="flex items-center gap-2">
      {/* Same castle as the favicon (src/app/icon.svg). */}
      <Image src="/icons/castle.svg" alt="" width={28} height={28} className="size-7" />
      <span className="text-lg font-bold">Ilya Like That!</span>
    </Link>
  );
}
