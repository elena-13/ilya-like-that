import { HandGiftIcon } from './HandIcons';
import { DEFAULT_STICKER, type StickerLook } from './Sticker';

type BookedLabelProps = {
  mine: boolean;
  // Colours of the gift sticker; cards pass the one their Book button
  // had, so the gift looks the same before and after booking.
  sticker?: StickerLook;
};

// Shows that a gift is booked: "your gift" for the person who booked it,
// "already gifted" for everyone else. Looks like the outlined sticker
// buttons (Log in, Cancel booking) but is only a label, not clickable.
export function BookedLabel({ mine, sticker = DEFAULT_STICKER }: BookedLabelProps) {
  return (
    <span className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-navy pl-1.5 pr-3.5 font-secondary text-sm text-navy">
      <span style={{ color: sticker.ink }}>
        <HandGiftIcon className="size-7" sticker={sticker.paper} />
      </span>
      {mine ? 'your gift' : 'already gifted'}
    </span>
  );
}
