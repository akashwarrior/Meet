import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VideoPrefs {
    videoInputDevice: MediaDeviceInfo | null;
    videoResolution: {
        width: number;
        height: number;
    };
    videoFrames: number;
    videoCodec: string;
}

interface AudioPrefs {
    audioInputDevice: MediaDeviceInfo | null;
    audioOutputDevice: MediaDeviceInfo | null;
}

interface MeetingPrefs {
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
}

interface MeetingPrefsState {
    video: VideoPrefs;
    audio: AudioPrefs;
    meeting: MeetingPrefs;
    setVideoPrefs: (videoPrefs: Partial<VideoPrefs>) => void;
    setAudioPrefs: (audioPrefs: Partial<AudioPrefs>) => void;
    setMeetingPrefs: (meetingPrefs: Partial<MeetingPrefs>) => void;
}


const defaultVideoPrefs: VideoPrefs = {
    videoInputDevice: null,
    videoResolution: { width: 1920, height: 1080 },
    videoFrames: 30,
    videoCodec: "video/H264",
};

const defaultAudioPrefs: AudioPrefs = {
    audioInputDevice: null,
    audioOutputDevice: null,
};

const useMeetingPrefsStore = create<MeetingPrefsState>()(
    persist(
        (set) => ({
            video: defaultVideoPrefs,
            audio: defaultAudioPrefs,
            meeting: {
                isVideoEnabled: false,
                isAudioEnabled: false,
            },

            setVideoPrefs: (videoPrefs) =>
                set((state) => ({
                    video: {
                        ...(state.video ?? defaultVideoPrefs),
                        ...videoPrefs,
                    },
                })),

            setAudioPrefs: (audioPrefs) =>
                set((state) => ({
                    audio: {
                        ...(state.audio ?? defaultAudioPrefs),
                        ...audioPrefs,
                    },
                })),

            setMeetingPrefs: (meetingPrefs) =>
                set((state) => ({
                    meeting: {
                        ...state.meeting,
                        ...meetingPrefs,
                    },
                })),
        }),
        {
            name: "meeting-prefs-storage", // key in localStorage
        }
    )
);

export default useMeetingPrefsStore;