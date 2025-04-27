"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "./theme-toggle"
import { toast } from "sonner"
import { ChevronDown, EllipsisVertical, Mic, MicOff, Video, VideoOff, Volume2, X } from "lucide-react"
import { motion } from 'motion/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog"

// https://meet.google.com/fse-tric-uft

export default function PreMeeting({ setIsLoading }: { setIsLoading: (isLoading: boolean) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const isMobile = useMobile({ width: 1024 });

    const nameRef = useRef<HTMLInputElement>(null)
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [isMicOn, setIsMicOn] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([])
    const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([])
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedAudioInput, setSelectedAudioDevice] = useState<MediaDeviceInfo | null>(null)
    const [selectedAudioOutput, setSelectedAudioOutput] = useState<MediaDeviceInfo | null>(null)
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<MediaDeviceInfo | null>(null)

    const [showPermissionDialog, setShowPermissionDialog] = useState<boolean | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Initialize camera and microphone
    useEffect(() => {
        if (isMobile || showPermissionDialog == null) return;
        const initializeDevices = async () => {
            try {
                // Get available media devices
                const devices = await navigator.mediaDevices.enumerateDevices()
                const audioInputs = devices.filter((device) => device.kind === "audioinput" && device.deviceId)
                const audioOutputs = devices.filter((device) => device.kind === "audiooutput" && device.deviceId)
                const videoInputs = devices.filter((device) => device.kind === "videoinput" && device.deviceId)


                // Set default devices
                if (audioInputs.length > 0) {
                    setAudioInputs(audioInputs)
                    setSelectedAudioDevice(audioInputs[0])
                }
                if (audioOutputs.length > 0) {
                    setAudioOutputs(audioOutputs)
                    setSelectedAudioOutput(audioOutputs[0])
                }
                if (videoInputs.length > 0) {
                    setVideoDevices(videoInputs)
                    setSelectedVideoDevice(videoInputs[0])
                }

            } catch (error) {
                console.error("Error initializing devices:", error)
                toast.error("Device Error", {
                    description: "Could not access camera or microphone. Please check your permissions.",
                })
            }
        }

        initializeDevices()

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [isMobile])


    const getMediaStream = async ({ audio = false, video = false }: { audio?: boolean, video?: boolean }) => {
        try {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }

            // Get new stream with selected devices
            const constraints: MediaStreamConstraints = {
                audio: audio ? (selectedAudioInput ? { deviceId: { exact: selectedAudioInput.deviceId } } : true) : false,
                video: video ? (selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice.deviceId } } : true) : false,
            }

            const newStream = await navigator.mediaDevices.getUserMedia(constraints)
            toast.success("Permissions granted", {
                description: "You can now use your microphone and camera.",
            });
            setStream(newStream)

            // Update video element with new stream
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
        } catch (error) {
            console.error("Error getting media stream:", error)
            toast.error("Media Error", {
                description: "Could not access selected devices. Please try different ones.",
            })
            throw error
        }
    }

    // Toggle camera
    const toggleCamera = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks()
            videoTracks.forEach((track) => {
                track.enabled = !isCameraOn
            })
        }
        setIsCameraOn(!isCameraOn)
    }

    // Toggle microphone
    const toggleMic = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks()
            audioTracks.forEach((track) => {
                track.enabled = !isMicOn
            })
        }
        setIsMicOn(!isMicOn)
    }

    // Join the meeting
    const joinMeeting = async () => {
        if (!nameRef.current?.value.trim()) {
            toast.error("Name Required", {
                description: "Please enter your name to join the meeting",
            })
            return
        }
        setIsJoining(true)
        setIsLoading(false)
    }

    return (
        <div className="min-h-[90vh] bg-background flex flex-col items-center justify-center">
            <header className="sticky top-0 mx-auto px-4 py-4 flex items-center justify-between w-full z-30 bg-background">
                <div className="flex items-center">
                    <svg viewBox="0 0 87 30" className="h-6 w-auto text-foreground" fill="currentColor">
                        <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
                    </svg>
                    <span className="ml-2 text-xl font-medium text-foreground">Meet</span>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex flex-col lg:flex-row gap-20 md:gap-5 items-center justify-around m-auto w-11/12">
                <div className="w-full lg:w-fit flex flex-col items-center lg:items-start overflow-hidden">
                    {(isCameraOn && false) ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full max-w-full max-h-full object-contain rounded-xl" />
                    ) : (
                        <div className="h-full aspect-video flex items-center justify-center bg-gray-950/90 relative w-full lg:w-[55vw] max-w-lg lg:max-w-[55vw] rounded-xl overflow-hidden">
                            <div className="text-white text-2xl">
                                Camera is off
                            </div>
                            <div className="absolute bottom-4 md:bottom-6 flex gap-6 left-0 right-0 mx-auto w-fit">
                                <Button
                                    variant={isMicOn ? "ghost" : "destructive"}
                                    size="icon"
                                    className="rounded-full p-6 md:p-6.5 flex"
                                    onClick={toggleMic}
                                >
                                    {isMicOn ? <Mic className="md:w-5! md:h-5!" /> : <MicOff className="md:w-5! md:h-5!" />}
                                </Button>

                                <Button
                                    variant={isCameraOn ? "ghost" : "destructive"}
                                    size="icon"
                                    className="rounded-full p-6 md:p-6.5 flex"
                                    onClick={toggleCamera}
                                >
                                    {isCameraOn ? <Video className="md:w-5! md:h-5!" /> : <VideoOff className="md:w-5! md:h-5!" />}
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute! rounded-full top-3.5 right-3.5 text-white hover:bg-primary/50"
                            >
                                <EllipsisVertical className="w-5! h-5!" />
                            </Button>
                        </div>
                    )}

                    {/* Device selection */}
                    <div className="my-4 gap-4 hidden lg:flex overflow-hidden">
                        <DropdownMenu modal={false} >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-full flex items-center justify-center gap-3 px-4! focus-visible:ring-0 max-w-1/4"
                                    disabled={!audioInputs.length}
                                >
                                    <Mic />
                                    <motion.span
                                        className="truncate"
                                        key={selectedAudioInput?.label}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {selectedAudioInput?.label || "Permission needed"}
                                    </motion.span>
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full h-full bg-background overflow-hidden"
                                >{audioInputs.map((device) =>
                                    <DropdownMenuItem
                                        key={device.deviceId}
                                        onClick={() => setSelectedAudioDevice(device)}
                                        className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === selectedAudioInput?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                                    >
                                        {device.label}
                                    </DropdownMenuItem>)}
                                </motion.div>

                            </DropdownMenuContent>
                        </DropdownMenu>


                        <DropdownMenu modal={false} >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-full flex items-center justify-center gap-3 px-4! focus-visible:ring-0 max-w-1/4"
                                    disabled={!audioOutputs.length}
                                >
                                    <Volume2 />
                                    <motion.span
                                        className="truncate"
                                        key={selectedAudioOutput?.label}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {selectedAudioOutput?.label || "Permission needed"}
                                    </motion.span>
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full h-full bg-background overflow-hidden"
                                >{audioOutputs.map((device) =>
                                    <DropdownMenuItem
                                        key={device.deviceId}
                                        onClick={() => setSelectedVideoDevice(device)}
                                        className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === selectedAudioOutput?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                                    >
                                        {device.label}
                                    </DropdownMenuItem>)}
                                </motion.div>

                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu modal={false} >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-full flex items-center justify-center gap-3 px-4! focus-visible:ring-0 max-w-1/4"
                                    disabled={!videoDevices.length}
                                >
                                    <Video />
                                    <motion.span
                                        className="truncate"
                                        key={selectedVideoDevice?.label}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {selectedVideoDevice?.label || "Permission needed"}
                                    </motion.span>
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-background p-0">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full h-full bg-background overflow-hidden"
                                >{videoDevices.map((device) =>
                                    <DropdownMenuItem
                                        key={device.deviceId}
                                        onClick={() => setSelectedVideoDevice(device)}
                                        className={`cursor-pointer px-4 py-3.5 hover:bg-primary/20 border-b ${device.deviceId === selectedVideoDevice?.deviceId && "bg-primary/15 hover:bg-primary/20!"}`}
                                    >
                                        {device.label}
                                    </DropdownMenuItem>)}
                                </motion.div>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="w-full max-w-xs flex flex-col gap-7 items-center">
                    <h1 className="text-2xl text-foreground">What's your name?</h1>
                    <Input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        ref={nameRef}
                        disabled={isJoining}
                        className="border rounded-md h-full bg-background focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 p-4.5 md:text-base"
                    />

                    <Button
                        variant="default"
                        className="text-base font-bold rounded-full px-16 py-7 mt-2"
                        onClick={joinMeeting}
                        disabled={isJoining}
                    >
                        {isJoining ? "Joining..." : "Join Meeting"}
                    </Button>
                </div>
            </main >
            <Dialog open={showPermissionDialog || showPermissionDialog == null}>
                <DialogContent className="px-0 [&>button]:hidden">
                    <DialogTitle className="absolute top-2 right-2">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPermissionDialog(false)}
                                className="focus-visible:ring-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                    </DialogTitle>
                    <div className="p-6">
                        <div className="flex justify-center m-6">
                            <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-27%20034204-FsmwxRnraI3X0Digp2nmdd6RDPRKt4.png"
                                alt="Permission illustration"
                                className="w-full max-w-xs"
                            />
                        </div>

                        <h2 className="text-2xl font-normal text-center m-4">
                            Do you want people to see and hear you in the meeting?
                        </h2>

                        <p className="text-center text-muted-foreground mb-8">
                            You can still turn off your microphone and camera anytime in the meeting.
                        </p>

                        <div className="flex flex-col gap-3 items-center">
                            <div className="flex w-full items-center justify-center gap-3">
                                <Button
                                    className="text-white py-5.5 rounded-full min-w-4/5 px-6"
                                    onClick={() => {
                                        setIsMicOn(true)
                                        setIsCameraOn(true)
                                        getMediaStream({ audio: true, video: true }).then(() => {
                                            setShowPermissionDialog(false)
                                        }).catch(() => {
                                            setIsMicOn(false)
                                            setIsCameraOn(false)
                                        });
                                    }}
                                >
                                    Use microphone and camera
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`text-primary rounded-full p-5 ${isCollapsed ? "rotate-180" : ""}`}
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                >
                                    <ChevronDown />
                                </Button>
                            </div>

                            <motion.div
                                initial={{ height: 0 }}
                                animate={isCollapsed ? { height: "auto" } : { height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex gap-3 md:gap-4 min-w-11/12 overflow-hidden">
                                <Button
                                    variant="outline"
                                    className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
                                    onClick={() => {
                                        setIsMicOn(true)
                                        getMediaStream({ audio: true }).then(() => {
                                            setShowPermissionDialog(false)
                                        }).catch(() => {
                                            setIsMicOn(false)
                                        });
                                    }}
                                >
                                    Use microphone
                                </Button>

                                <Button
                                    variant="outline"
                                    className="rounded-full flex-1 py-5 px-6.5 text-primary hover:text-primary hover:bg-primary/10!"
                                    onClick={() => {
                                        setIsCameraOn(true)
                                        getMediaStream({ video: true }).then(() => {
                                            setShowPermissionDialog(false)
                                        }).catch(() => {
                                            setIsCameraOn(false)
                                        });
                                    }}
                                >
                                    Use camera
                                </Button>
                            </motion.div>

                            <Button variant="ghost" className="mr-4 p-5 rounded-full" onClick={() => setShowPermissionDialog(false)}>
                                Continue without microphone and camera
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}