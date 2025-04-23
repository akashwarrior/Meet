'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LiveClock } from "@/components/liveClock"
import { useRouter } from "next/navigation"
import { useRef, useState, useCallback } from "react"
import { toast } from "sonner"
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog"
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  LucideVideo,
  LucideKeyboard,
  LucideChevronDown,
  LucideCheck,
  LucideCopy,
  LucideX
} from "lucide-react"


export default function Home() {
  const router = useRouter()
  const [meetingLink, setMeetingLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const meetingCodeRef = useRef<HTMLInputElement>(null)


  // Function to generate a meeting link
  const generateMeetingLink: () => Promise<string | null> = useCallback(async () => {
    setLoading(true)
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    if (response.status === 200) {
      return res.link
    } else {
      toast.error(res.error, {
        description: "Please try again later",
      })
      return null
    }
  }, []);


  // Function to start an instant meeting
  const startInstantMeeting = useCallback(async () => {
    const link = await generateMeetingLink();
    if (link) {
      router.push(`/meeting/${link.split('/').pop()}`)
    } else {
      setLoading(false)
    }
  }, [router, generateMeetingLink]);


  // Function to schedule a meeting for later
  const scheduleForLater = useCallback(async () => {
    const link = await generateMeetingLink();
    if (link) {
      setMeetingLink(link);
    }
    setLoading(false)
  }, [generateMeetingLink]);


  // Function to join a meeting
  const joinMeeting = useCallback(async () => {
    const meetingCode = meetingCodeRef.current?.value || ""

    if (!meetingCode.trim()) {
      meetingCodeRef.current?.focus()
      toast.error("Meeting code required", {
        description: "Please enter a meeting code to join",
      })
      return
    }
    setLoading(true)
    const response = await fetch(`/api/meetings/${meetingCode}`);
    const res = await response.json();
    if (response.status === 200) {
      router.push(`/meeting/${meetingCode.split('/').pop()}`)
    } else {
      toast.error(res.error, {
        description: "Please check the meeting code and try again",
      })
    }
    setLoading(false)
  }, [router]);


  // Function to copy the meeting link to clipboard
  const copyMeetingLink = useCallback(async () => {
    if (!meetingLink?.trim()) return

    try {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      await navigator.clipboard.writeText(meetingLink)

      toast.success("Meeting link copied", {
        description: "Link copied to clipboard",
      })
    } catch (error) {
      toast.error("Failed to copy link", {
        description: String(error),
      })
    }
  }, [meetingLink]);


  return (
    <div className="bg-background">
      <header>
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg viewBox="0 0 87 30" className="h-6 w-auto text-foreground" fill="currentColor">
              <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
            </svg>
            <span className="ml-2 text-xl font-medium text-foreground">Meet</span>
          </div>
          <div className="flex items-center space-x-4">
            <LiveClock />
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex flex-col md:px-4 py-12 md:py-0 md:flex-row items-center justify-between max-w-7xl">
        <div className="max-w-lg md:mb-0 m-10">
          <h1 className="text-3xl md:text-5xl text-foreground mb-6">
            Video calls and meetings for everyone.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Connect, collaborate and celebrate from anywhere with Meet
          </p>
          <div className="flex flex-col xl:flex-row gap-3 xl:items-center relative">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center justify-center flex-1 h-fit py-4 hover:ring-4 hover:ring-primary/50 focus-visible:ring-primary/50">
                  <LucideVideo className="mr-2 h-5 w-5" />
                  New meeting
                  <LucideChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full bg-background overflow-hidden"
                >
                  <DropdownMenuItem
                    onClick={startInstantMeeting}
                    className="cursor-pointer px-4 py-3 hover:bg-primary/20 border-b"
                  >
                    Start an instant meeting
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={scheduleForLater}
                    className="cursor-pointer px-4 py-3 hover:bg-primary/20"
                  >
                    Create a meeting for later
                  </DropdownMenuItem>
                </motion.div>

              </DropdownMenuContent>
            </DropdownMenu>

            {/* </Link> */}
            <div className="flex items-center bg-background border-3 rounded-2xl flex-1/12 focus-within:border-primary transition-[border-color] duration-200 px-2">
              <LucideKeyboard size={28} />
              <Input
                type="text"
                placeholder="Enter a code or link"
                ref={meetingCodeRef}
                className="border-none h-full focus-visible:ring-0 bg-background py-4"
              />
            </div>

            <Button
              variant="ghost"
              className="text-base font-bold rounded-full px-6 py-5.5"
              onClick={joinMeeting}>
              Join
            </Button>

          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-muted-foreground">
              <span className="text-primary hover:underline cursor-pointer">
                Learn more
              </span>{" "}
              about Google Meet
            </p>
          </div>
        </div>

        <div className="max-w-lg m-5 md:mx-auto">
          <Image
            width={500}
            height={500}
            loading="lazy"
            src="/img.jpeg"
            alt="People in a video conference"
            className="w-full rounded-lg"
          />
        </div>
      </main>

      {/* Meeting Info Dialog */}
      <Dialog open={meetingLink !== null} onOpenChange={() => setMeetingLink(null)}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full bg-background overflow-hidden"
          >
            <DialogTitle className="flex justify-between items-center mb-3 text-xl font-semibold">
              Here&apos;s your joining information
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="focus-visible:ring-0">
                  <LucideX className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Send this to people that you want to meet with. Make sure that you save it so that you can use it later,
              too.
            </p>

            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-neutral-800 p-3 rounded-md overflow-hidden">
              <div className="flex-1 truncate">{meetingLink}</div>
              <Button
                onClick={copyMeetingLink}
                variant="ghost"
                size="icon"
                className={copied ? "text-green-600" : ""}
              >
                {copied ? <LucideCheck className="h-5 w-5" /> : <LucideCopy className="h-5 w-5" />}
              </Button>
            </div>

            <DialogFooter className="mt-6 flex justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button
                onClick={() => router.push(`/meeting/${meetingLink?.split('/').pop()}`)}
              >
                Join now
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={loading}>
        <DialogContent className="sm:max-w-md [&>button]:hidden outline-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full bg-background"
          >
            <DialogTitle />
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-medium">
                {!(meetingCodeRef.current?.value) ? "Creating your" : "Finding"} meeting...
              </h3>
              <p className="text-gray-500 text-sm mt-2">This will only take a moment</p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}