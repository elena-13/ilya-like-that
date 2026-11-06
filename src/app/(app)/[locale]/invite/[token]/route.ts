import { NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { paths } from '@/lib/paths';
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  isInviteToken,
} from '@/features/invite/inviteAccess';

type Params = { params: Promise<{ locale: string; token: string }> };

/**
 * The secret share link for the birthday invite. A valid token is remembered
 * in a cookie and the guest lands on the home page, where the owl brings the
 * invite. Any other token just goes home, so the link can't be guessed by
 * looking for an error page.
 */
export async function GET(_request: Request, { params }: Params) {
  const { locale, token } = await params;
  const home = getPathname({
    href: paths.home(),
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  });

  // A relative Location, so it stays on the public host behind the proxy.
  const response = new NextResponse(null, {
    status: 307,
    headers: {
      Location: home,
      // Keep the token out of shared caches and the next page's Referer.
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });

  if (isInviteToken(token)) {
    response.cookies.set(INVITE_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: INVITE_COOKIE_MAX_AGE,
    });
  }

  return response;
}
