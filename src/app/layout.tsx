import type { Metadata } from "next";
import localFont from 'next/font/local'
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import "./globals.css";

const myFont = localFont({
  src: [
    {
      weight: '400',
      path: '../fonts/regular.woff2',
    },
    {
      weight: '700',
      path: '../fonts/bold.woff2',
    },
  ],
})

export const metadata: Metadata = {
  icons: './icon.svg',
  title: "Meet - Professional Video Conferencing",
  description: "Connect securely with end-to-end encryption. Host video meetings and collaborate with just a few clicks.",
  keywords: "video conferencing, online meetings, collaboration, end-to-end encryption, secure communication",
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(NEXT_AUTH);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={myFont.className}>
        <Providers session={session}>
          {children}
        </Providers>
        <Toaster richColors theme="light" />
      </body>
    </html >
  );
}
