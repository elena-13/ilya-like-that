import { paths } from '@/lib/paths';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold">Gift not found 🕵️‍♀️</h2>
      <p className="text-gray-600">The link might be outdated, or the item has been removed.</p>
      <Link href={paths.home()} className="px-6 py-2 bg-black text-white rounded-lg">
        Back to wishlist
      </Link>
    </div>
  );
}
