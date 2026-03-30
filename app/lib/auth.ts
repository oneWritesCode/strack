import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // authorization: {
      //   params: {
      //     scope:
      //       "openid email profile https://www.googleapis.com/auth/calendar.events.readonly",
      //     access_type: "offline",
      //     prompt: "consent",
      //   },
      // },
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ account }) {
      if (account?.provider === "google" && account.access_token) {
        try {
          // Ensure we update the account with the latest tokens on every login
          // This is useful if scopes have changed or if we need a fresh refresh_token
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (existingAccount) {
            await prisma.account.update({
              where: { id: existingAccount.id },
              data: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                refresh_token:
                  account.refresh_token ?? existingAccount.refresh_token,
                scope: account.scope ?? existingAccount.scope,
                id_token: account.id_token ?? existingAccount.id_token,
              },
            });
            console.log("Updated Google account tokens in database");
          }
        } catch (error) {
          console.error("Error updating account tokens on sign-in:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
