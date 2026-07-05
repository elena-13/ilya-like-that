import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Route guard for admin-only endpoints.
 * Returns a NextResponse to short-circuit (401/403) when the caller isn't an
 * admin, or null when access is granted.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  if (!session.user.isAdmin) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  return null;
}
