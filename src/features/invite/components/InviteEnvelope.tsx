import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import { HandHeartIcon } from '@/features/wishlist/components/HandIcons';
import { DEFAULT_STICKER } from '@/features/wishlist/components/Sticker';

import { INVITE_AGE } from '../config';

// The envelope and the invite card inside it. Sizes come from the envelope
// width (--ew); fonts use container units, so the card scales as a whole.
//
// Layers, back to front: envelope back, flap (once open), card, front
// pocket, flap (while closed). InviteOverlay animates the parts it gets by
// data-part: the flap turns over its top edge, the card slides up.

export const ENVELOPE_RATIO = 114 / 176; // height / width, same as in the sprite
/** Card size and travel, as shares of the envelope width. */
export const CARD = { width: 0.88, height: 1.0, startTop: 0.03, lift: 0.58 };

// A deeper shade of the castle logo's blue (#6b84c8, public/icons/castle.svg),
// dark enough to read comfortably on the cream card.
const BLUE = '#3a519b';

export const InviteEnvelope = forwardRef<HTMLDivElement, { titleId: string }>(
  function InviteEnvelope({ titleId }, ref) {
    const t = useTranslations('invite');

    return (
      <div
        ref={ref}
        className="relative [container-type:inline-size] [perspective:900px]"
        style={{ width: 'var(--ew)', height: `calc(var(--ew) * ${ENVELOPE_RATIO})` }}
      >
        {/* back */}
        <div className="absolute inset-0 rounded-[1.5cqw] bg-[#ecdfc8] shadow-[0_2cqw_6cqw_rgb(22_39_91/0.35)]" />

        {/* flap: turns over its top edge; data-part lets the overlay animate it */}
        <div
          data-part="flap"
          className="absolute inset-x-0 top-0 z-30 origin-top [transform-style:preserve-3d]"
          style={{ height: `calc(var(--ew) * ${ENVELOPE_RATIO * 0.6})` }}
        >
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="block h-full w-full overflow-visible"
          >
            <path
              d="M0.5 0.5 L50 39 L99.5 0.5 Z"
              fill="#f4e9d7"
              stroke="#cdbba2"
              strokeWidth="0.8"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* card window: clips the card to the envelope until it slides out */}
        <div
          data-part="card-window"
          className="absolute bottom-0 z-10 overflow-hidden"
          style={{
            left: `${((1 - CARD.width) / 2) * 100}%`,
            width: `${CARD.width * 100}%`,
            height: '100%',
            // Hidden while the envelope is shut: the flap and pocket edges
            // don't meet exactly, and the text would show through.
            visibility: 'hidden',
          }}
        >
          <div
            data-part="card"
            className="absolute inset-x-0 flex flex-col items-center rounded-[1cqw] bg-[#fbf6ec] px-[5cqw] pt-[5cqw] text-center shadow-[0_0_2cqw_rgb(0_0_0/0.08)]"
            style={{
              color: BLUE,
              top: `calc(var(--ew) * ${CARD.startTop})`,
              height: `calc(var(--ew) * ${CARD.height})`,
              fontFamily: "var(--font-primary), 'Philosopher UA', sans-serif",
            }}
          >
            <h2 id={titleId} className="w-full text-[9.2cqw] leading-[0.95] font-bold uppercase">
              <span className="block text-left">{t('titleLine1')}</span>
              <span className="block text-right">{t('titleLine2')}</span>
            </h2>

            <p className="mt-[3.5cqw] text-[3.4cqw] leading-snug font-medium">
              {t.rich('text', { b: (chunks) => <b className="font-bold">{chunks}</b> })}
            </p>

            <div className="mt-[3cqw] flex w-full items-center justify-center gap-[2.5cqw]">
              <span className="flex-1 border-y-[0.35cqw] border-current py-[0.8cqw] text-[3.4cqw] font-bold uppercase">
                {t('ageBefore')}
              </span>
              <span className="text-[13cqw] leading-none font-medium">
                {INVITE_AGE}
                <sup className="text-[4cqw] align-[5.5cqw]">
                  {t('ageSuffix', { age: INVITE_AGE })}
                </sup>
              </span>
              <span className="flex-1 border-y-[0.35cqw] border-current py-[0.8cqw] text-[3.4cqw] font-bold uppercase">
                {t('ageAfter', { age: INVITE_AGE })}
              </span>
            </div>

            <p className="mt-[3cqw] text-[5cqw] font-bold uppercase">{t('when')}</p>
            <p className="mt-[0.6cqw] text-[3.8cqw] font-bold uppercase tracking-wide">
              {t('where')}
            </p>
            <p className="mt-[2.5cqw] text-[3.2cqw] font-medium italic">{t('signoff')}</p>
          </div>
        </div>

        {/* front pocket */}
        <svg
          viewBox={`0 0 100 ${ENVELOPE_RATIO * 100}`}
          preserveAspectRatio="none"
          className="absolute inset-0 z-20 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="invite-pocket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6ecdc" />
              <stop offset="1" stopColor="#efe2cc" />
            </linearGradient>
          </defs>
          <path
            d={`M0 1.5 L50 ${ENVELOPE_RATIO * 100 * 0.62} L100 1.5 L100 ${ENVELOPE_RATIO * 100} L0 ${ENVELOPE_RATIO * 100} Z`}
            fill="url(#invite-pocket)"
            stroke="#d8c7ad"
            strokeWidth="0.8"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M1 ${ENVELOPE_RATIO * 100 - 1} Q30 ${ENVELOPE_RATIO * 100 * 0.78} 50 ${ENVELOPE_RATIO * 100 * 0.7} Q70 ${ENVELOPE_RATIO * 100 * 0.78} 99 ${ENVELOPE_RATIO * 100 - 1}`}
            fill="none"
            stroke="#e0d0b6"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* heart seal: hand-drawn sticker, same colours as the Log in icon */}
        <HandHeartIcon
          sticker={DEFAULT_STICKER.paper}
          className="absolute top-[78%] left-1/2 z-20 w-[13cqw] -translate-x-1/2 -translate-y-1/2"
          style={{ color: DEFAULT_STICKER.ink }}
        />
      </div>
    );
  },
);
