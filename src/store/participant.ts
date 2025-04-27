import { WebRTCService } from '@/lib/webrtc-service'
import { create } from 'zustand'

interface Track {
    id: number
    track: MediaStreamTrack | null
}

interface Participant {
    id: number
    name: string
}

interface ParticipantStore {
    participants: Participant[]
    videoTracks: Track[]
    audioTracks: Track[]
    addParticipant: (participant: Participant) => void
    removeParticipant: (id: number) => void
    updateTracks: (track: Track, kind: string) => void
}

const useParticipantStore = create<ParticipantStore>()((set) => ({
    participants: [],
    videoTracks: [],
    audioTracks: [],
    addParticipant: (participant) => set((state) => ({
        audioTracks: [...state.audioTracks, { id: participant.id, track: null }],
        videoTracks: [...state.videoTracks, { id: participant.id, track: null }],
        participants: [...state.participants, participant]
    })),
    removeParticipant: (id) => set((state) => ({ participants: state.participants.filter((p) => p.id !== id) })),
    updateTracks: ({ id, track }, kind) => set((state) => ({
        [kind === "video" ? "videoTracks" : "audioTracks"]: state[kind === "video" ? "videoTracks" : "audioTracks"]
            .map((t) => t.id === id ? { ...t, track } : t),
    })),
}))

interface WebRTCStore {
    webRTCService: WebRTCService | null
    setWebRTCService: (webRTCService: WebRTCService | null) => void
}

export const useWebRTCStore = create<WebRTCStore>()((set) => ({
    webRTCService: null,
    setWebRTCService: (webRTCService) => set({ webRTCService })
}))

interface SidebarOpenStore {
    sidebarOpen: boolean
    activeTab: string
    setSidebarOpen: (open: boolean) => void
    setActiveTab: (tab: string) => void
}

export const useSidebarOpenStore = create<SidebarOpenStore>()((set) => ({
    sidebarOpen: false,
    activeTab: "participants",
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setActiveTab: (activeTab) => set({ activeTab })
}))

export default useParticipantStore;