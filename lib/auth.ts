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
      if (token && session.user) {
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }

      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      if (account) {
        token.accessToken = account.access_token
        if (account.provider === 'google') {
          token.id = profile?.sub
          token.accessToken = account.access_token
          token.accessTokenExpires = Date.now() + (typeof account.expires_in === "number" ? account.expires_in * 1000 : 0)
          token.refreshToken = account.refresh_token
          //user
        }
        // return {
        //   accessToken: account.access_token,
        //   accessTokenExpires: Date.now() + account.expires_in * 1000,
        //   refreshToken: account.refresh_token,
        //   user
        // }
      }
      return token
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