import type { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/libs/api";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const result = await api<User>("/auth/login", {
          method: "POST",
          body: { email: credentials.email, password: credentials.password },
        });
        return result.ok ? result.data : null; // null = wrong email or password
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      return user ? { ...token, id: user.id, role: user.role, token: user.token } : token;
    },
    session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name ?? "",
        email: token.email ?? "",
        role: token.role,
        token: token.token,
      };
      return session;
    },
  },
};
