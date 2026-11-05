import type { SVGProps } from 'react';

// Hand-drawn style icons: slightly wobbly marker strokes that match the
// handwritten card font. They inherit color from `currentColor`.

type IconProps = SVGProps<SVGSVGElement>;

function HandIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function HandGiftIcon(props: IconProps) {
  return (
    <HandIcon {...props}>
      {/* lid */}
      <path d="M3.2 9.1C7 8.7 15 8.9 20.9 8.6L21.1 12.2C15 12.5 8 12.3 3 12.4Z" />
      {/* box */}
      <path d="M4.3 12.5L4.6 20.8C9 21.1 15 20.7 19.6 20.9L19.9 12.3" />
      {/* ribbon */}
      <path d="M11.8 8.8L12.1 20.9" />
      {/* bow */}
      <path d="M11.9 8.6C9.5 4.5 6 4.8 6.6 6.7C7.2 8.3 10 8.6 11.9 8.6" />
      <path d="M12 8.6C13.8 4.2 17.6 4.6 17.2 6.5C16.8 8.2 14 8.5 12 8.6" />
    </HandIcon>
  );
}

export function HandCrossIcon(props: IconProps) {
  return (
    <HandIcon {...props}>
      <path d="M6.2 5.8C10 10 14 14.5 18.1 18.4" />
      <path d="M17.6 6.1C13.5 10.2 9.8 14.1 5.9 18.2" />
    </HandIcon>
  );
}

export function HandExternalLinkIcon(props: IconProps) {
  return (
    <HandIcon {...props}>
      <path d="M10.5 5.5C8 5.4 6 5.6 4.8 5.7L4.6 19.3C9 19.5 14 19.2 18.4 19.4L18.6 13.4" />
      <path d="M10.8 13.1C13.5 10.4 16.3 7.6 19.2 4.9" />
      <path d="M13.6 4.6C15.6 4.8 17.5 4.7 19.3 4.8L19.1 10.4" />
    </HandIcon>
  );
}
