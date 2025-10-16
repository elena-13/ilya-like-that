'use client';

import Link from 'next/link';

import { paths } from '@/lib/paths';

export function BrandLink() {
  return (
    <Link href={paths.home()} className="flex items-center gap-2">
      <span className="text-lg font-bold">🎁 Ilya Like That!</span>
    </Link>
  );
}
