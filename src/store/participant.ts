import { create } from 'zustand'

interface Participant {
    id: string
    name: string
}

interface ParticipantStore {
    participants: Participant[]
    addParticipant: (participant: Participant) => void
    removeParticipant: (id: string) => void
}

const useParticipantStore = create<ParticipantStore>()((set) => ({
    participants: [],
    videoTracks: [],
    audioTracks: [],
    addParticipant: (participant) => set((state) => ({
        participants: [...state.participants, participant]
    })),
    removeParticipant: (id) => set((state) => ({ participants: state.participants.filter((p) => p.id !== id) })),
}))

export default useParticipantStore;