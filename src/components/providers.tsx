'use client';

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes'

export default function Providers({
    children,
    session,
}: Readonly<{
    children: React.ReactNode;
    session: Session | null;
}>) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="dark">
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}