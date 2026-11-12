import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import NavBar from "@/components/NavBar";
import NextAuthProvider from "@/providers/NextAuthProvider";
import "./globals.css";

const plex = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "CourtBook",
  description: "จองสนามกีฬาของ CourtBook",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th">
      <body className={plex.className}>
        <NextAuthProvider session={session}>
          <NavBar />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
