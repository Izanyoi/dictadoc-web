import { create } from 'zustand'
import { useTranscriptStore } from './app_data';

// Start the app by prompting for mic access
initAudio(false);

async function initAudio(blocking: boolean): Promise<boolean> {
    const fn = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            useAudioStore.getState().setRecorder(recorder);

            recorder.ondataavailable = (e: BlobEvent) => {
                useAudioStore.setState((state) => ({
                    chunks: [...state.chunks, e.data]
                }));
            };

            recorder.onstop = () => {
                const state = useAudioStore.getState();
                const blob = new Blob(state.chunks, { type: "audio/ogg; codecs=opus" });
                const audioURL = window.URL.createObjectURL(blob);

                useTranscriptStore.getState().updateTranscriptAudio(state.recording, audioURL);

                useAudioStore.setState({
                    recording: 0,
                    chunks: [],
                });
            };
            return true;
        } catch (error) {
            console.error("Error accessing microphone:", error);
            return false;
        }
    };

    if (blocking) {
        return await fn();
    } else {
        fn(); // Not awaited, fire-and-forget
        return true;
    }
}

type AudioStore = {
    recorder: MediaRecorder | null;

    // 0 for none, otherwise ID of the current transcript
    recording: number,
    chunks: Blob[],

    setRecorder: (recorder: MediaRecorder) => void;
    startRecording: (id: number) => void;
    stopRecording: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
    recorder: null,
    recording: 0,
    chunks: [],

    setRecorder: (recorder) => set({ recorder }),

    startRecording: async (id) => {
        let recorder = get().recorder;

        // If no recorder exists, try creating one now
        if (!recorder) {
            const success = await initAudio(true);
            if (!success) {
                console.error("Failed to initialize audio");
                return;
            }
            recorder = get().recorder;
        }

        if (!recorder) { // for TypeScript satisfaction
            console.error("Concurrency Issue");
            return;
        }

        set({ recording: id, chunks: [] });
        recorder.start();
        console.log("Recording Started");
    },

    stopRecording: () => {
        const recorder = get().recorder;
        if (get().recording === 0 || !recorder) return;

        recorder.stop();
    }
}));

export function playAudio(id: number, start: number, end: number) {
    new Audio("a");
}