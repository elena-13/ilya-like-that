import Link from 'next/link';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { WishlistItemBase } from '@/features/wishlist/types';
import { paths } from '@/lib/paths';

type WishlistItemRowProps = {
  item: WishlistItemBase;
  onEdit: () => void;
  onDelete: () => void;
};

export default function WishlistItemRow({ item, onEdit, onDelete }: WishlistItemRowProps) {
  return (
    <li className="flex items-center gap-4 rounded-2xl bg-card p-3 ring-1 ring-black/5">
      {/* Admin thumbnail: plain img avoids next/image remote-domain config
          for arbitrary admin-supplied image URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt=""
        className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
      />

      <div className="min-w-0 flex-1">
        <p className="text-xs text-navy/60">{item.brand}</p>
        <p className="truncate font-bold text-navy">{item.name}</p>
        <div className="flex flex-wrap gap-x-3 text-xs text-navy/50">
          <Link href={paths.item(item.slug, item.id)} className="hover:underline">
            /{item.slug}
          </Link>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            link
          </a>
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${item.name}`} onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${item.name}`}
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
