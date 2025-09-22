import "@/styles/globals.css";

import { type Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme/theme-provider";

import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Hawk",
  description:
    "Hawk is a platform for monitoring your website and services. Get notified when your website is down or when your service is not working as expected.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
  openGraph: {
    images: "/hawk-og.png",
  },
  metadataBase: new URL(env.BASE_URL),
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
