'use client'

import { useEffect, useState } from "react"
import MeetingFooter from "@/components/meetingFooter"
import MeetingHeader from "@/components/meetingHeader"
import VideoGrid from "@/components/videoGrid"
import { WebRTCService } from "@/lib/webrtc-service"
import useParticipantStore, { useWebRTCStore } from "@/store/participant"
import SideBar from "../sideBar"

const useWebRTC = (meetingId: string) => {
    const [service, setService] = useState<WebRTCService | null>(null);

    useEffect(() => {
        WebRTCService.getInstance(meetingId).then((instance) => {
            setService(instance);
        }).catch((error) => {
            console.error("Error initializing WebRTC service:", error);
        });

        return () => {
            service?.close();
            setService(null);
        }
    }, []);

    return service;
}

export default function Meeting({ meetingId }: { meetingId: string }) {
    const service = useWebRTC(meetingId);
    const { addParticipant, removeParticipant, updateTracks } = useParticipantStore()
    const { setWebRTCService } = useWebRTCStore()
    const participantsLength = useParticipantStore((state) => state.participants.length)

    useEffect(() => {
        if (!service) return;
        setWebRTCService(service);
        service.getParticipants(addParticipant);
        service.onParticipantLeave(removeParticipant);
        service.getMediaStreams(updateTracks);
    }, [service]);

    return (
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
        </div >
    )
}