import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const plex = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "CourtBook",
  description: "จองสนามกีฬาของ CourtBook",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th">
      <body className={plex.className}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
