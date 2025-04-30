'use client'

import { ThemeToggle } from "@/components/theme-toggle"
import { LiveClock } from "@/components/liveClock"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"
import Link from "next/link"

export default function Header() {
    const { data: session } = useSession()

    return (
        <header className="w-full">
            <div className="px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <svg viewBox="0 0 87 30" className="h-6 w-auto text-foreground" fill="currentColor">
                        <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
                    </svg>
                    <span className="ml-2 text-xl font-medium text-foreground">Meet</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <LiveClock />
                    <ThemeToggle />
                    {session?.user ? (
                        <Button
                            onClick={() => signOut()}
                            className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium"
                        >
                            {session.user.name?.charAt(0).toUpperCase()}
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            onClick={() => signIn()}
                            className="px-6 rounded-md"
                        >
                            Sign In
                        </Button>
                    )
                    }
                </div>
            </div>
        </header>
    )
}