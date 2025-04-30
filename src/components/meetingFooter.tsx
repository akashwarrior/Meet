'use client'

import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { LiveClock } from "./liveClock";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MessageSquare, Mic, MicOff, Phone, Users, Video, VideoOff } from "lucide-react";
import { WebRTCService } from "@/lib/webrtc-service";
import useSidebarOpenStore from "@/store/sideBar";
import useMeetingPrefsStore from "@/store/meetingPrefs";

const MeetingFooter = memo(({ service }: { service: WebRTCService }) => {
    const router = useRouter()
    const [showSettings, setShowSettings] = useState(false)
    const {
        audio: {
            audioInputDevice,
        },
        video: {
            videoInputDevice,
        },
        meeting: {
            isAudioEnabled,
            isVideoEnabled
        },
        setMeetingPrefs,
        setAudioPrefs,
        setVideoPrefs,
    } = useMeetingPrefsStore()
    const { sidebarOpen, activeTab, setSidebarOpen, setActiveTab } = useSidebarOpenStore()

    // Device settings
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])

    useEffect(() => {
        // Get audio and video devices
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                const audio = devices.filter((device) => device.kind === "audioinput" && device.deviceId)
                const video = devices.filter((device) => device.kind === "videoinput" && device.deviceId)
                setAudioDevices(audio)
                setVideoDevices(video)
            })

        navigator.mediaDevices.ondevicechange = () => {
            navigator.mediaDevices.enumerateDevices()
                .then((devices) => {
                    const audio = devices.filter((device) => device.kind === "audioinput")
                    const video = devices.filter((device) => device.kind === "videoinput")
                    setAudioDevices(audio)
                    setVideoDevices(video)
                    setAudioPrefs({ audioInputDevice: audio[0] || "default" })
                    setVideoPrefs({ videoInputDevice: video[0] || "default" })
                })
        }
    }, [isAudioEnabled, isVideoEnabled, setAudioPrefs, setVideoPrefs])

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
                        variant={!isAudioEnabled ? "destructive" : "secondary"}
                        onClick={() => {
                            if (!isAudioEnabled) {
                                service.sendAudioStream({})
                            } else {
                                service.stopAudioStream()
                            }
                            setMeetingPrefs({ isAudioEnabled: !isAudioEnabled })
                        }}
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        {!isAudioEnabled ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                        size="icon"
                        variant={!isVideoEnabled ? "destructive" : "secondary"}
                        onClick={() => {
                            if (!isVideoEnabled) {
                                service.sendVideoStream({})
                            } else {
                                service.stopVideoStream()
                            }
                            setMeetingPrefs({ isVideoEnabled: !isVideoEnabled })
                        }}
                        className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    >
                        {!isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    {/* <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsRecording(!isRecording)}>
                                {isRecording ? "Stop recording" : "Start recording"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowSettings(true)}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                if (document.fullscreenElement) {
                                    document.exitFullscreen()
                                } else {
                                    document.documentElement.requestFullscreen()
                                }
                            }}>
                                <Maximize className="h-4 w-4 mr-2" />
                                {document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}

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
                                <Select value={audioInputDevice?.deviceId} onValueChange={(deviceId) => {
                                    setAudioPrefs({ audioInputDevice: audioDevices.find((device) => device.deviceId === deviceId) })
                                }}>
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (!isAudioEnabled) {
                                            service.sendAudioStream({})
                                        } else {
                                            service.stopAudioStream()
                                        }
                                        setMeetingPrefs({ isAudioEnabled: !isAudioEnabled })
                                    }}
                                >
                                    {!isAudioEnabled ? "Unmute" : "Mute"}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Video</h3>
                            <div className="space-y-2">
                                <Label htmlFor="camera">Camera</Label>
                                <Select value={videoInputDevice?.deviceId} onValueChange={(deviceId) => {
                                    setVideoPrefs({ videoInputDevice: videoDevices.find((device) => device.deviceId === deviceId) })
                                }}>
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (!isVideoEnabled) {
                                            service.sendVideoStream({})
                                        } else {
                                            service.stopVideoStream()
                                        }
                                        setMeetingPrefs({ isVideoEnabled: !isVideoEnabled })
                                    }}
                                >
                                    {!isVideoEnabled ? "Turn on" : "Turn off"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </footer >
    )
})

MeetingFooter.displayName = "MeetingFooter"
export default MeetingFooter