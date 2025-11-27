import { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Load config from siteconfig.json
const loadConfig = async () => {
  try {
    const response = await fetch(process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/siteconfig.json` : "http://localhost:5000/siteconfig.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Could not load siteconfig.json");
  }
  return { clientId: "", clientSecret: "" };
};

let config: any = null;

const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const secret = process.env.NEXTAUTH_SECRET;

if (!clientId || !clientSecret || !secret) {
  console.error("❌ Missing Discord auth env vars:", {
    clientId: !!clientId ? "✅" : "❌ DISCORD_CLIENT_ID missing",
    clientSecret: !!clientSecret ? "✅" : "❌ DISCORD_CLIENT_SECRET missing",
    secret: !!secret ? "✅" : "❌ NEXTAUTH_SECRET missing",
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: clientId || "",
      clientSecret: clientSecret || "",
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: secret,
};
