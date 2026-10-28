import type { BrowserContext } from '@playwright/test';
import { encode } from 'next-auth/jwt';

export type TestUser = {
  id: string;
  email: string;
  name: string;
};

export const userA: TestUser = { id: 'e2e-user-a', email: 'alice@e2e.test', name: 'Alice Tester' };
export const userB: TestUser = { id: 'e2e-user-b', email: 'bob@e2e.test', name: 'Bob Tester' };

// next-auth's cookie name on plain http (https uses the __Secure- prefix).
const SESSION_COOKIE = 'next-auth.session-token';

/**
 * Signs the context in as `user` without going through Google: builds the same
 * JWT next-auth would issue and sets it as the session cookie.
 */
export async function loginAs(context: BrowserContext, user: TestUser) {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is missing; check .env.test.local');
  }

  // `id` is required: the session callback in src/lib/auth.ts copies it onto session.user.
  const token = await encode({
    token: { sub: user.id, id: user.id, email: user.email, name: user.name },
    secret,
  });

  const baseURL = process.env.NEXTAUTH_URL ?? 'http://localhost:3001';

  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      url: baseURL,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}
