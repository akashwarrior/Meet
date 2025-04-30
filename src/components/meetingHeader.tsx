'use client';

import { toast } from "sonner";
import { memo, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "@/components/theme-toggle"
import { Users, Info, UserPlus, Copy, Shield } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { WebRTCService } from "@/lib/webrtc-service";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";


interface WaitingParticipant {
    id: string
    name: string
    joinTime: string
}

const MeetingHeader = memo(({ meetingId, service }: { meetingId: string, service: WebRTCService }) => {
    const [showInviteDialog, setShowInviteDialog] = useState(false)
    const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([])
    const [showWaitingRoom, setShowWaitingRoom] = useState(false)

    // Copy meeting link
    const copyMeetingLink = () => {
        // const link = `${window.location.origin}/meeting/${id}?name=Guest`
        // navigator.clipboard.writeText(link)
        toast.success("Meeting link copied", {
            description: "Share this link with others to invite them",
            duration: 2000,
        })
    }

    useEffect(() => {
        service.onUserRequest(({ name, sender }) => {
            setWaitingParticipants((prev) => {
                return [...prev, { id: sender, name, joinTime: new Date().toLocaleTimeString() }]
            });
        })

        service.onParticipantLeave((sender) => {
            setWaitingParticipants((prev) => prev.filter((p) => p.id !== sender))
        });
    }, [service])


    // Add participant admission functions
    const admit = (participantId: string) => {
        const waitingParticipant = waitingParticipants.find((p) => p.id === participantId)
        if (waitingParticipant) {
            // Add to participants
            service.acceptRequest(participantId)

            // Remove from waiting room
            setWaitingParticipants((prev) => prev.filter((p) => p.id !== participantId))

            toast.success("Participant admitted", {
                description: `${waitingParticipant.name} has been admitted to the meeting`,
                duration: 1500,
            })
        }
    }

    const rejectParticipant = (participantId: string) => {
        const waitingParticipant = waitingParticipants.find((p) => p.id === participantId)
        if (waitingParticipant) {
            service.rejectRequest(participantId)
            // Remove from waiting room
            setWaitingParticipants((prev) => prev.filter((p) => p.id !== participantId))

            toast.success("Participant rejected", {
                description: `${waitingParticipant.name} has been denied access to the meeting`,
                duration: 2000,
            })
        }
    }

    return (
        <header className="border-b border-border px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
                <svg viewBox="0 0 87 30" className="h-5 w-auto text-foreground" fill="currentColor">
                    <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
                </svg>
                <span className="ml-2 text-lg font-medium text-foreground">Meet</span>
            </div>
            <div className="flex items-center">
                <ThemeToggle />
                {waitingParticipants.length > 0 && (
                    <Button variant="outline" size="sm" className="relative ml-2" onClick={() => setShowWaitingRoom(true)}>
                        <Users className="h-4 w-4 mr-1" />
                        Waiting
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {waitingParticipants.length}
                        </span>
                    </Button>
                )}

                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-foreground">
                            <UserPlus className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite people</DialogTitle>
                            <DialogDescription>Share this meeting link with others you want to invite</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 mt-4">
                            {/* <Input value={`${window.location.origin}/meeting/${id}?name=Guest`} readOnly className="flex-1" /> */}
                            <Button onClick={copyMeetingLink} size="icon">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Security options</h4>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Only people who receive the link can join</span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-foreground">
                            <Info className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-medium">Meeting details</div>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                            <div className="text-xs text-muted-foreground">Meeting ID</div>
                            <div className="text-sm">{meetingId}</div>
                        </div>
                        <div className="px-2 py-1.5">
                            <div className="text-xs text-muted-foreground">Joining info</div>
                            {/* <div className="text-sm">{`${window.location.origin}/meeting/${id}?name=Guest`}</div> */}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={copyMeetingLink}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy joining info
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Waiting Room Dialog */}
            <Dialog open={showWaitingRoom} onOpenChange={setShowWaitingRoom}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Waiting Room</DialogTitle>
                        <DialogDescription>These participants are waiting to join the meeting</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {waitingParticipants.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No one is waiting to join</p>
                        ) : (
                            <div className="space-y-3">
                                {waitingParticipants.map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between border-b border-border pb-3">
                                        <div className="flex items-center">
                                            <Avatar className="h-8 w-8 mr-3">
                                                <AvatarFallback className="bg-yellow-500">{participant.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{participant.name}</div>
                                                <div className="text-xs text-muted-foreground">Waiting since {participant.joinTime}</div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => rejectParticipant(participant.id)}
                                                className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                Deny
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => admit(participant.id)}
                                            >
                                                Admit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    )
});

MeetingHeader.displayName = "MeetingHeader";
export default MeetingHeader;