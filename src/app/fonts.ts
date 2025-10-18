import localFont from 'next/font/local';
import { Faculty_Glyphic } from 'next/font/google';

// Local Neurath
export const neurath = localFont({
  src: [
    { path: './assets/fonts/Neurath-Light.otf', weight: '300', style: 'normal' },
    { path: './assets/fonts/Neurath-Regular.otf', weight: '400', style: 'normal' },
    { path: './assets/fonts/Neurath-Medium.otf', weight: '500', style: 'normal' },
    { path: './assets/fonts/Neurath-SemiBold.otf', weight: '600', style: 'normal' },
    { path: './assets/fonts/Neurath-Bold.otf', weight: '700', style: 'normal' },
    { path: './assets/fonts/Neurath-ExtraBold.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-primary',
  display: 'swap',
});

// Google Faculty Glyphic
export const facultyGlyphic = Faculty_Glyphic({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-secondary',
  display: 'swap',
});
