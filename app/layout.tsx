import type { Metadata } from "next";
import { Funnel_Sans, Bubblegum_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Loading from "./components/Loading";

const FunnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  weight: "400",
});

const bubblegumSans = Bubblegum_Sans({
  variable: "--font-bubblegum-sans",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Skill Tracker",
  description: "Track your skills and improve productivity",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bubblegumSans.variable} ${FunnelSans.variable} text-(--text-color) antialiased`}
      >
        <Providers>
          <Loading />
          {/* <NotificationPermission /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
