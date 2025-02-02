import type { Metadata } from "next";
import "./globals.css";

import { PostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: "SteamFiber",
  description: "Create a 3D map of your network of Steam Friends",
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
