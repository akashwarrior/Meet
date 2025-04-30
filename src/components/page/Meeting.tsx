'use client'

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { WebRTCService } from "@/lib/webrtc-service"
import MeetingFooter from "@/components/meetingFooter"
import MeetingHeader from "@/components/meetingHeader"
import VideoGrid from "@/components/videoGrid"
import SideBar from "@/components/sideBar"
import PreMeeting from "@/components/preMeeting"
import useParticipantStore from "@/store/participant"
import useStreamTrackstore from "@/store/streamTrack"
import useMeetingPrefsStore from "@/store/meetingPrefs"

export default function Meeting({ name: userName, isHost, meetingId }: {
    name?: string | null,
    isHost: boolean,
    meetingId: string,
}) {
    const { addParticipant, removeParticipant } = useParticipantStore()
    const { updateTracks } = useStreamTrackstore()
    const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [name, setName] = useState(userName || "")
    const { audio, video, meeting } = useMeetingPrefsStore();

    useEffect(() => {
        if (isLoading || webRTCService) return;
        console.log(name)
        WebRTCService
            .getInstance({
                name,
                meetingId,
                isVideoEnabled: meeting.isVideoEnabled,
                isAudioEnabled: meeting.isAudioEnabled,
                videoResolution: video.videoResolution,
                videoFrames: video.videoFrames,
                videoCodec: video.videoCodec,
                videoDeviceId: video.videoInputDevice?.deviceId,
                audioDeviceId: audio.audioInputDevice?.deviceId,
            })
            .then((instance) => {
                instance.onConnectionSuccess(() => {
                    setWebRTCService(instance);
                    setIsLoading(false);
                })
                instance.onParticipantJoined(addParticipant);
                instance.onParticipantLeave(removeParticipant);
                instance.onMediaTrack(updateTracks);

                return () => {
                    instance.close();
                }
            })
            .catch((error) => {
                toast.error("Error joining meeting", {
                    description: error.message,
                })
                setIsLoading(true);
                setWebRTCService(null);
                console.log("Error initializing WebRTC service:", error);
            });
    }, [video, audio, meeting, isLoading, webRTCService, name, meetingId, addParticipant, removeParticipant, updateTracks]);

    return ((!webRTCService) ?
        <PreMeeting
            name={name}
            isHost={isHost}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setName={setName}
        />
        :
        <div className="h-screen flex flex-col bg-background">
            <MeetingHeader
                meetingId={meetingId}
                service={webRTCService}
            />
            <div className="flex-1 flex overflow-hidden">
                <VideoGrid />
                <SideBar service={webRTCService} />
            </div>
            <MeetingFooter service={webRTCService} />
        </div>
    )
}