import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' as const },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isAdmin = isAdminEmail(session.user.email);
      } else {
        console.error('ID is missing in the token, cannot add to session.');
      }

      return session;
    },
  },
};
