'use client'

import { memo, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { MicOff, MoreHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import useParticipantStore from "@/store/participant"

export const Participant = memo(({ participant, onMute, onRemove }: {
    participant: {
        id: number
        name: string
    }
    onMute?: () => void
    onRemove?: () => void
}) => {
    console.log("Participant", participant.name)
    const audioTrack = useParticipantStore((state) => state.audioTracks.find((track) => track.id === participant.id)?.track)
    const videoTrack = useParticipantStore((state) => state.videoTracks.find((track) => track.id === participant.id)?.track)
    const audioRef = useRef<HTMLAudioElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    console.log("Audio Track by ", participant.name)

    useEffect(() => {
        if (audioTrack) {
            if (!streamRef.current) {
                streamRef.current = new MediaStream()
            }
            streamRef.current.addTrack(audioTrack)
            if (!audioRef.current) {
                audioRef.current = new Audio();
            }
            audioRef.current.srcObject = streamRef.current
            audioRef.current.volume = 1;
            audioRef.current.play().catch((error) => {
                console.log("Error playing audio:", error)
            })
        } else {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.srcObject = null
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
        }


        return () => {
            if (audioRef.current) {
                audioRef.current?.pause()
                audioRef.current.srcObject = null
            }
            audioRef.current = null
            streamRef.current?.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
    }, [audioTrack])

    return (
        <div className="w-full h-full bg-gradient-to-br from-muted to-primary/15 flex items-center justify-center relative rounded-md mx-auto overflow-hidden">
            {videoTrack ? (
                <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    ref={(video) => {
                        if (video) {
                            const stream = new MediaStream()
                            stream.addTrack(videoTrack!)
                            video.srcObject = stream
                        }
                    }}
                />
            ) : (
                <Avatar className="h-20 w-20 bg-white p-2.5">
                    {/* <AvatarImage src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${participant.name!}`} /> */}
                    <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center gap-1">
                    {!audioTrack && <MicOff className="h-3 w-3" />}
                    <span>{participant.name}</span>
                </div>
            </div>

            <div className="absolute top-2 right-2 flex space-x-1">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onMute}>
                            {audioTrack ? "Mute" : "Request Unmute"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onRemove}
                            className="text-red-500"
                        >
                            Remove from meeting
                        </DropdownMenuItem>
                    </DropdownMenuContent>

                </DropdownMenu>
            </div>
        </div >
    )
});