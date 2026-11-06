import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip the Payload admin, all API routes (Payload + next-auth), Next internals
  // and anything with a file extension (images, fonts, favicon...).
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
};
