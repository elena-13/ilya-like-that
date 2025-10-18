import Image from 'next/image';
import { kv } from '@vercel/kv';

import WishlistList from '@/features/wishlist/components/WishlistList';
import { WishlistItem } from '@/features/wishlist/types';
import { StarsField } from '@/features/wishlist/components/StarsField';

async function getWishlistItems(): Promise<WishlistItem[]> {
  try {
    const items = await kv.get<WishlistItem[]>('wishlist');
    return items || [];
  } catch (error) {
    console.error('Failed to fetch wishlist items:', error);
    return [];
  }
}

export default async function Home() {
  const items = await getWishlistItems();

  return (
    <main className="min-h-screen">
      <section aria-label="Intro" className="min-h-dvh flex px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-8">
        <div
          className="
            bg-blue p-6 lg:p-8 rounded-4xl flex flex-col gap-16
            bg-linear-to-b from-sky-blue via-sky-pink via-90% to-sky-peach
            relative overflow-clip w-full grow       min-h-full
          "
        >
          <div className="relative flex items-center justify-center text-center flex-col gap-6 lg:gap-10 p-6 lg:p-10 grow    min-h-full ">
            <h1 className="text-9xl font-primary font-extrabold text-navy max-w-6xl relative z-20">
              Ilya Like That!
            </h1>
            <p className="text-3xl font-secondary text-navy max-w-2xl z-20">
              A little wishlist for a little human.
            </p>

            {/* right cloud */}
            <div className="absolute max-w-none top-1/2 left-1/2 w-full pointer-events-none z-10">
              <Image
                src="/cloud-1.webp"
                alt="Cloud"
                width={3320}
                height={2203}
                className="
                  w-full h-full object-contain
                  transform-gpu will-change-[transform]
                  animate-[cloud-float-1_14s_ease-in-out_infinite]
                  [animation-delay:0.6s]
                  motion-safe:animate-[cloud-float-1_14s_ease-in-out_infinite]
                "
              />
            </div>

            {/* left cloud */}
            <div className="absolute max-w-none -top-1/15 right-1/2 w-[110%] pointer-events-none z-10">
              <Image
                src="/cloud-1.webp"
                alt="Cloud"
                width={3320}
                height={2203}
                className="
                  w-full h-full object-contain transform scale-x-[-1]
                  transform-gpu will-change-[transform]
                  animate-[cloud-float-2_16s_ease-in-out_infinite]
                  [animation-delay:1.4s]
                  motion-safe:animate-[cloud-float-2_16s_ease-in-out_infinite]
                "
              />
            </div>

            {/* stars */}
            <StarsField />
          </div>
        </div>
      </section>

      <section id="wishlist" aria-label="Wishlist" className="px-4 lg:px-8 py-10 lg:py-16">
        <div className="mx-auto w-full max-w-screen-xl">
          <WishlistList items={items} />
        </div>
      </section>
    </main>
  );
}
