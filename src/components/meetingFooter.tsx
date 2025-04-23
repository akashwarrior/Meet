'use client'

import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { LiveClock } from "./liveClock";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Maximize, MessageSquare, Mic, MicOff, Monitor, MoreVertical, Phone, Users, Video, VideoOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useSidebarOpenStore, useWebRTCStore } from "@/store/participant";

const MeetingFooter = memo(() => {
    const router = useRouter()
    const service = useWebRTCStore((state) => state.webRTCService)
    const [showSettings, setShowSettings] = useState(false)

    const [isMuted, setIsMuted] = useState(true)
    const [isVideoOff, setIsVideoOff] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const { sidebarOpen, activeTab, setSidebarOpen, setActiveTab } = useSidebarOpenStore()

    // Device settings
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("mic")
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("camera")

    useEffect(() => {
        // Get audio and video devices
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                const audio = devices.filter((device) => device.kind === "audioinput")
                const video = devices.filter((device) => device.kind === "videoinput")
                console.log("Audio devices: ", audio)
                console.log("Video devices: ", video)
                setAudioDevices(audio)
                setVideoDevices(video)
                setSelectedAudioDevice(audio[0]?.deviceId || "mic")
                setSelectedVideoDevice(video[0]?.deviceId || "camera")
            })

        navigator.mediaDevices.ondevicechange = (device) => {
            console.log("Device changed: ", device)
            navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    const audio = devices.filter((device) => device.kind === "audioinput")
                    const video = devices.filter((device) => device.kind === "videoinput")
                    setAudioDevices(audio)
                    setVideoDevices(video)
                    setSelectedAudioDevice(audio[0]?.deviceId || "mic")
                    setSelectedVideoDevice(video[0]?.deviceId || "camera")
                })
        }
    }, [isMuted, isVideoOff])

    // Toggle sidebar
    const toggleSidebar = (tab: string) => {
        if (sidebarOpen && activeTab === tab) {
            setSidebarOpen(false)
        } else {
            setSidebarOpen(true)
            setActiveTab(tab)
        }
    }

    // Leave the meeting
    const leaveCall = () => {
        router.push("/")
    }

    return (
        <footer className="bg-background border-t border-border py-3 px-4 md:py-4 md:px-6">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground hidden md:block">
                    <LiveClock />
                </div>
                <div className="flex items-center space-x-1 md:space-x-2 mx-auto md:mx-0">
                    <Button
                        size="icon"
                        variant={isMuted ? "destructive" : "secondary"}
                        onClick={() => {
                            if (!service) return
                            (!isMuted ? service.stopAudioStream : service.sendAudioStream).bind(service)()
                            setIsMuted(!isMuted)
                        }}
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                        size="icon"
                        variant={isVideoOff ? "destructive" : "secondary"}
                        onClick={() => {
                            if (!service) return
                            (!isVideoOff ? service.stopVideoStream : service.sendVideoStream).bind(service)()
                            setIsVideoOff(!isVideoOff)
                        }}
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    <Button
                        variant={isScreenSharing ? "destructive" : "secondary"}
                        size="icon"
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        <Monitor className="h-5 w-5" />
                    </Button>

                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                {isRecording ? "Stop recording" : "Start recording"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => document.documentElement.requestFullscreen()}>
                                <Maximize className="h-4 w-4 mr-2" />
                                Full screen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        onClick={() => toggleSidebar("chat")}
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "rounded-full h-10 w-10 md:h-12 md:w-12",
                            activeTab === "chat" && sidebarOpen && "bg-blue-100 dark:bg-blue-900",
                        )}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={() => toggleSidebar("participants")}
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "rounded-full h-10 w-10 md:h-12 md:w-12",
                            activeTab === "participants" && sidebarOpen && "bg-blue-100 dark:bg-blue-900",
                        )}
                    >
                        <Users className="h-5 w-5" />
                    </Button>

                    <Button onClick={leaveCall} variant="destructive" className="rounded-full h-10 px-4 md:h-12 md:px-6">
                        <Phone className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:inline">Leave</span>
                    </Button>
                </div>
                <div className="w-24 hidden md:block"></div> {/* Spacer for centering */}
            </div>
            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Audio</h3>
                            <div className="space-y-2">
                                <Label htmlFor="microphone">Microphone</Label>
                                <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                                    <SelectTrigger id="microphone">
                                        <SelectValue placeholder="Select microphone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {audioDevices.map((device) => (
                                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm">Mute/Unmute</span>
                                <Button variant="outline" size="sm">
                                    {isMuted ? "Unmute" : "Mute"}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Video</h3>
                            <div className="space-y-2">
                                <Label htmlFor="camera">Camera</Label>
                                <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                                    <SelectTrigger id="camera">
                                        <SelectValue placeholder="Select camera" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {videoDevices.map((device) => (
                                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm">Camera</span>
                                <Button variant="outline" size="sm">
                                    {isVideoOff ? "Turn on" : "Turn off"}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Layout</h3>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </footer >
    )
})

export default MeetingFooter