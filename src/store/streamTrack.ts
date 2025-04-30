import { create } from "zustand"

interface Track {
    id: string
    track: MediaStreamTrack | null
}

interface StreamTrackStore {
    videoTracks: Track[]
    audioTracks: Track[]
    updateTracks: (track: Track, kind: string) => void
}

const useStreamTrackstore = create<StreamTrackStore>()((set) => ({
    videoTracks: [],
    audioTracks: [],
    updateTracks: ({ id, track }, kind) => set((state) => {
        const key = kind === "video" ? "videoTracks" : "audioTracks"
        const existing = state[key]
        const index = existing.findIndex(t => t.id === id)

        let updatedTracks
        if (index !== -1) {
            // update existing
            updatedTracks = [...existing]
            updatedTracks[index] = { id, track }
        } else {
            // add new
            updatedTracks = [...existing, { id, track }]
        }

        return { [key]: updatedTracks }
    }),
}))

export default useStreamTrackstore