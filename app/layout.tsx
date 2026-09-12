import type { Metadata } from "next";
import { Poppins, IBM_Plex_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/meetpixils/site-chrome";

/* MeetPixils DS v1.0 type stack:
   Poppins — display + body · IBM Plex Mono — metadata · Noto Sans Arabic — RTL */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeetPixils — where MENA design grows up",
  description:
    "Competitions, programmes and events for designers across MENA. MeetBattle, MeetAcademy, MeetExperience and MeetBrands, in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${plexMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><SiteChrome>{children}</SiteChrome></body>
    </html>
  );
}
