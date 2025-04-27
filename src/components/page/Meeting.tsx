'use client'

import { useEffect, useState } from "react"
import MeetingFooter from "@/components/meetingFooter"
import MeetingHeader from "@/components/meetingHeader"
import VideoGrid from "@/components/videoGrid"
import SideBar from "@/components/sideBar"
import PreMeeting from "@/components/preMeeting"
import { WebRTCService } from "@/lib/webrtc-service"
import useParticipantStore, { useWebRTCStore } from "@/store/participant"

export default function Meeting({ meetingId }: { meetingId: string }) {
    const { addParticipant, removeParticipant, updateTracks } = useParticipantStore()
    const { webRTCService, setWebRTCService } = useWebRTCStore()
    const participantsLength = useParticipantStore((state) => state.participants.length)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isLoading || webRTCService) return;
        console.log("Initializing WebRTC service...")
        WebRTCService
            .getInstance(meetingId)
            .then((instance) => {
                setWebRTCService(instance)
                instance.onParticipantJoined(addParticipant);
                instance.onParticipantLeave(removeParticipant);
                instance.onMediaTrack(updateTracks);

                return () => {
                    instance.close();
                }
            })
            .catch((error) => {
                setIsLoading(true);
                setWebRTCService(null);
                console.error("Error initializing WebRTC service:", error);
            });
    }, [isLoading, webRTCService, meetingId, addParticipant, removeParticipant, updateTracks]);

    return ((!webRTCService) ?
        <PreMeeting
            setIsLoading={setIsLoading}
        />
        :
        <div className="h-screen flex flex-col bg-background">
            <MeetingHeader meetingId={meetingId}
                admitParticipant={({ id, name }) => {
                    console.log("Admit participant", id, name)
                }} />
            <div className="flex-1 flex overflow-hidden">
                <VideoGrid participantsLength={participantsLength} />
                <SideBar />
            </div>
            <MeetingFooter />
        </div>
    )
}