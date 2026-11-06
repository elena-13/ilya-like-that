import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

// The birthday invite goes only to people who opened the secret share link
// (/invite/<BIRTHDAY_INVITE_TOKEN>). Opening it stores the token in a cookie,
// so the invite keeps showing in that browser on later visits, signed in or not.
// Changing BIRTHDAY_INVITE_TOKEN revokes every old link and cookie.

export const INVITE_COOKIE = 'birthday-invite';

/** A year: guests may come back to the wishlist long after opening the link. */
export const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** True when `token` matches BIRTHDAY_INVITE_TOKEN. Unset means no link works. */
export function isInviteToken(token: string | undefined): boolean {
  const expected = process.env.BIRTHDAY_INVITE_TOKEN;
  if (!expected || !token) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Whether this visitor opened the share link in this browser. */
export async function hasInviteAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return isInviteToken(cookieStore.get(INVITE_COOKIE)?.value);
}
