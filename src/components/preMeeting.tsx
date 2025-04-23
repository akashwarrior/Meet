"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideVideo, LucideVideoOff, LucideMic, LucideMicOff, LucideArrowLeft, LucideSettings } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "./theme-toggle"
import { toast } from "sonner"

export default function PreMeeting() {
    const router = useRouter()
    const searchParams = useSearchParams()  
    const isInstantMeeting = searchParams.get("instant") === "true"
    const videoRef = useRef<HTMLVideoElement>(null)

    // State for user inputs and device settings
    const [name, setName] = useState("")
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [isJoining, setIsJoining] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("")
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("")
    const [showSettings, setShowSettings] = useState(false)

    // Initialize camera and microphone
    useEffect(() => {
        const initializeDevices = async () => {
            try {
                // Get available media devices
                const devices = await navigator.mediaDevices.enumerateDevices()
                const audioInputs = devices.filter((device) => device.kind === "audioinput")
                const videoInputs = devices.filter((device) => device.kind === "videoinput")

                setAudioDevices(audioInputs)
                setVideoDevices(videoInputs)

                // Set default devices
                if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId)
                if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId)

                // Initialize media stream with default devices
                await getMediaStream()
            } catch (error) {
                console.error("Error initializing devices:", error)
                toast.error("Device Error", {
                    description: "Could not access camera or microphone. Please check your permissions.",
                })
            }
        }

        initializeDevices()

        // Cleanup function to stop all tracks when component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    // Get media stream with current device selections
    const getMediaStream = async () => {
        try {
            // Stop any existing stream
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }

            // Get new stream with selected devices
            const constraints: MediaStreamConstraints = {
                audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
                video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
            }

            const newStream = await navigator.mediaDevices.getUserMedia(constraints)
            setStream(newStream)

            // Update video element with new stream
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
        } catch (error) {
            console.error("Error getting media stream:", error)
            toast("Media Error", {
                description: "Could not access selected devices. Please try different ones.",
            })
        }
    }

    // Update stream when device selections change
    useEffect(() => {
        if (selectedAudioDevice || selectedVideoDevice) {
            getMediaStream()
        }
    }, [selectedAudioDevice, selectedVideoDevice])

    // Toggle camera
    const toggleCamera = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks()
            videoTracks.forEach((track) => {
                track.enabled = !isCameraOn
            })
            setIsCameraOn(!isCameraOn)
        }
    }

    // Toggle microphone
    const toggleMic = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks()
            audioTracks.forEach((track) => {
                track.enabled = !isMicOn
            })
            setIsMicOn(!isMicOn)
        }
    }

    // Join the meeting
    const joinMeeting = () => {
        if (!name.trim()) {
            toast("Name Required", {
                description: "Please enter your name to join the meeting",
            })
            return
        }

        setIsJoining(true)

        // Generate a random meeting ID
        const meetingId = Math.random().toString(36).substring(2, 12)

        // Store user preferences in localStorage
        localStorage.setItem("userName", name)
        localStorage.setItem("isCameraOn", isCameraOn.toString())
        localStorage.setItem("isMicOn", isMicOn.toString())

        // Simulate API call delay
        setTimeout(() => {
            // Navigate to meeting room
            router.push(`/meeting/${meetingId}?name=${encodeURIComponent(name)}`)
        }, 1000)
    }

    // If it's an instant meeting and we have a name in localStorage, join immediately
    useEffect(() => {
        if (isInstantMeeting) {
            const savedName = localStorage.getItem("userName")
            if (savedName) {
                setName(savedName)
                // Small delay to allow the UI to render first
                const timer = setTimeout(() => {
                    joinMeeting()
                }, 500)
                return () => clearTimeout(timer)
            }
        }
    }, [isInstantMeeting])

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
                            <LucideArrowLeft className="h-5 w-5" />
                        </Button>
                        <svg viewBox="0 0 87 30" className="h-6 w-auto text-foreground" fill="currentColor">
                            <path d="M6.94 14.97c0-3.26-.87-5.83-2.6-7.69C2.6 5.4.7 4.5 0 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C23.4 24.6 25.3 25.5 26 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C22.6 5.4 20.7 4.5 20 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C43.4 24.6 45.3 25.5 46 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C42.6 5.4 40.7 4.5 40 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75zm12 0c0 3.32.87 5.89 2.6 7.75C63.4 24.6 65.3 25.5 66 25.5v-21c-.7 0-2.6.9-4.34 2.78-1.73 1.86-2.6 4.43-2.6 7.75zm8.06 0c0-3.32-.87-5.89-2.6-7.75C62.6 5.4 60.7 4.5 60 4.5v21c.7 0 2.6-.9 4.34-2.78 1.73-1.86 2.6-4.43 2.6-7.75z" />
                        </svg>
                        <span className="ml-2 text-xl font-medium text-foreground">Meet</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:space-x-8">
                <div className="md:w-1/2 mb-8 md:mb-0">
                    <Card className="overflow-hidden">
                        <div className="relative bg-black aspect-video">
                            {isCameraOn ? (
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 dark:bg-gray-900">
                                    <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-medium">
                                        {name ? name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                </div>
                            )}

                            {/* Camera and mic status indicators */}
                            <div className="absolute bottom-4 left-4 flex space-x-2">
                                {!isCameraOn && (
                                    <div className="bg-red-500 text-white px-2 py-1 rounded-md text-sm flex items-center">
                                        <LucideVideoOff className="h-4 w-4 mr-1" />
                                        Camera off
                                    </div>
                                )}
                                {!isMicOn && (
                                    <div className="bg-red-500 text-white px-2 py-1 rounded-md text-sm flex items-center">
                                        <LucideMicOff className="h-4 w-4 mr-1" />
                                        Mic off
                                    </div>
                                )}
                            </div>

                            {/* Settings button */}
                            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                                    >
                                        <LucideSettings className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Device Settings</DialogTitle>
                                        <DialogDescription>Select your audio and video devices</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="microphone">Microphone</Label>
                                            <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                                                <SelectTrigger id="microphone">
                                                    <SelectValue placeholder="Select microphone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {audioDevices.map((device) => (
                                                        <SelectItem key={device.deviceId} value={device.deviceId}>
                                                            {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="camera">Camera</Label>
                                            <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                                                <SelectTrigger id="camera">
                                                    <SelectValue placeholder="Select camera" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {videoDevices.map((device) => (
                                                        <SelectItem key={device.deviceId} value={device.deviceId}>
                                                            {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <CardContent className="p-4">
                            <div className="flex justify-center space-x-4">
                                <Button
                                    onClick={toggleMic}
                                    variant={isMicOn ? "secondary" : "destructive"}
                                    size="icon"
                                    className="rounded-full h-12 w-12"
                                >
                                    {isMicOn ? <LucideMic className="h-5 w-5" /> : <LucideMicOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    onClick={toggleCamera}
                                    variant={isCameraOn ? "secondary" : "destructive"}
                                    size="icon"
                                    className="rounded-full h-12 w-12"
                                >
                                    {isCameraOn ? <LucideVideo className="h-5 w-5" /> : <LucideVideoOff className="h-5 w-5" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:w-1/2">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <h1 className="text-2xl font-semibold text-foreground">Ready to join?</h1>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Your Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Your name will be visible to other participants in the meeting.
                                </p>
                            </div>

                            <Button
                                onClick={joinMeeting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isJoining}
                            >
                                {isJoining ? "Joining..." : "Join Meeting"}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                By joining, you agree to allow Google Meet to use your camera and microphone
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}