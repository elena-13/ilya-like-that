import type { SVGProps } from 'react';

// Hand-drawn style icons: slightly wobbly marker strokes that match the
// handwritten card font. They inherit color from `currentColor`.

export type HandIconProps = SVGProps<SVGSVGElement> & {
  // Sticker colour: draws a thick rounded outline that follows the icon's
  // shape behind it, like a die-cut sticker.
  sticker?: string;
};

function HandIcon({ children, sticker, ...props }: HandIconProps) {
  return (
    <svg
      // A sticker widens the canvas so the drawing sits smaller inside
      // a thicker outline.
      viewBox={sticker ? '-7 -7 38 38' : '0 0 24 24'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      aria-hidden
      {...props}
    >
      {sticker && (
        // The same drawing again, filled and stroked very thick: it spreads
        // into a soft blob around the icon. CSS overrides each path's own width.
        <g stroke={sticker} fill={sticker} className="[&_path]:[stroke-width:13px]">
          {children}
        </g>
      )}
      {children}
    </svg>
  );
}

export function HandGiftIcon(props: HandIconProps) {
  // Same drawing as public/icons/gift.svg
  return (
    <HandIcon strokeWidth={1.3} {...props}>
      {/* lid edge, a bit heavier */}
      <path d="M4.7 8.4C9.2 8.1 14.8 8 19.2 7.9" strokeWidth={1.8} />
      {/* box, slightly narrower at the bottom */}
      <path d="M4.9 8.5C5.1 11.9 5.4 15.6 5.7 18.8C9.8 19 14 18.9 17.9 18.9C18.3 15.3 18.7 11.6 19 8" />
      {/* ribbon, centred on x = 12 */}
      <path d="M11 8.3L11.1 18.9" />
      <path d="M13 8.2L12.9 18.9" />
      {/* bow loops meeting at the centre */}
      <path d="M12 7.4C10.6 4.9 7.5 3.3 6.3 4.5C5.3 5.6 7.4 7.4 12 7.4Z" strokeWidth={1.7} />
      <path d="M12 7.4C13.4 4.7 16.7 3 17.8 4.3C18.8 5.6 16.5 7.3 12 7.4Z" strokeWidth={1.7} />
    </HandIcon>
  );
}

export function HandCrossIcon(props: HandIconProps) {
  return (
    <HandIcon {...props}>
      <path d="M6.2 5.8C10 10 14 14.5 18.1 18.4" />
      <path d="M17.6 6.1C13.5 10.2 9.8 14.1 5.9 18.2" />
    </HandIcon>
  );
}

export function HandExternalLinkIcon(props: HandIconProps) {
  // Same drawing as public/icons/link.svg
  return (
    <HandIcon strokeWidth={2} {...props}>
      {/* box, open at the top-right */}
      <path d="M10.3 5.7C8.4 5.5 6.7 5.7 5.3 5.9C4.9 10 5.1 14.6 5.4 18.6C9.5 18.9 13.9 18.8 18.1 18.5C18.4 16.9 18.4 15.2 18.2 13.7" />
      {/* arrow out of the box */}
      <path d="M11.1 12.9C13.4 10.6 15.7 8.2 18.5 5.6" />
      <path d="M13.8 5.2C15.5 5.1 17.1 5.2 18.7 5.4C18.9 7 18.8 8.5 18.6 10.1" />
    </HandIcon>
  );
}

export function HandHeartIcon(props: HandIconProps) {
  // Same drawing as the envelope seal in scripts/sprites/owl-flying.mjs
  return (
    <HandIcon strokeWidth={1.9} {...props}>
      {/* outline, the tip doesn't quite close, like a quick marker stroke */}
      <path d="M12 19.2C9.6 17.4 6.9 15.3 5.3 12.9C3.9 10.8 4.2 7.9 6.3 6.6C8.4 5.4 10.8 6.3 11.9 8.6C13.1 6.2 15.6 5.1 17.8 6.4C19.9 7.7 20.2 10.6 18.8 12.7C17.3 15.1 14.6 17.3 12.3 19" />
      {/* little shine */}
      <path d="M7.5 9.6C7.6 8.8 8.1 8.2 8.9 8" strokeWidth={1.5} />
    </HandIcon>
  );
}

export function HandLoginIcon(props: HandIconProps) {
  return (
    <HandIcon strokeWidth={2} {...props}>
      {/* door frame */}
      <path d="M13.5 4.6C15.6 4.5 17.4 4.6 19 4.8C19.2 9.6 19.1 14.4 19 19.3C17.3 19.5 15.5 19.4 13.6 19.3" />
      {/* arrow going in */}
      <path d="M4.8 12.1C8 12 11.2 12.1 14.2 12" />
      <path d="M10.6 8.4C11.9 9.6 13.1 10.8 14.3 12C13.1 13.2 11.9 14.4 10.6 15.6" />
    </HandIcon>
  );
}
