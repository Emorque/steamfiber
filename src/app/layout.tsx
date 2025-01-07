import type { Metadata } from "next";
import "./globals.css";

// import { PostHogProvider } from './providers'

import { PostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: "SteamFiber",
  description: "See your network of Steam Friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
