import type { NextAuthOptions } from "next-auth"
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "./db"



export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(client),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {

    async signIn() {
      return true
    },

    async session({ token, session }) {
      // This callback is called whenever a session is checked (e.g., on useSession())
      // You need to explicitly copy properties from the `token` (JWT) to the `session` object.

      // Copy access token from JWT to session
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      // Copy user data from JWT to session
      if (token.user) {
        session.user.name = token.user.name;
        session.user.email = token.user.email;
        session.user.image = token.user.image;
      } else if (token.name || token.email || token.picture) { // Fallback if token.user wasn't explicitly set
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture; // 'picture' is often used for image URL in JWT
      }


      // The `session` object is what `useSession()` will return on the client.
      console.log("Session Callback - Session:", session); // Inspect this to see if accessToken is present

      return session; // Always return the session
    },
    async jwt({ token, user, account, profile }) {
      // This callback is called when the JWT is created or updated.

      // If a user *just signed in* (account object is present)
      if (account) {
        // For OAuth providers like Google, access_token is in `account`
        if (account.access_token) {
          token.accessToken = account.access_token;
          // For Google, `profile.sub` is the user's Google ID
          // If your backend uses this as `id`, then assign it.
          token.id = profile?.sub as string; // Cast to string if `id` is string
          // Store other user info in the token if you want it persistent
          token.user = {
            name: user.name as string,
            email: user.email as string,
            image: user.image as string,
          };
        }
        // If you have other providers (e.g., CredentialsProvider), handle them here
        // else if (account.provider === 'credentials' && user) {
        //    token.accessToken = (user as any).accessToken; // Assuming your authorize callback returns this
        //    token.id = user.id;
        //    token.user = { id: user.id, name: user.name, email: user.email, image: user.image };
        // }
      }

      // The `token` object is what NextAuth uses internally.
      // Ensure `accessToken` is set on this token object.
      console.log("JWT Callback - Token:", token); // Inspect this to see if accessToken is present

      return token; // Always return the token
    },
  },
}

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions)
}