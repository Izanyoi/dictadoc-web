import { create } from 'zustand'
import { useTranscriptContentStore } from './transcript_data';


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

                useTranscriptContentStore.getState().updateTranscriptAudio(state.recording, audioURL);

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

type AudioStatus = "NoMic" | "Recording" | "Ready";

type AudioStore = {
    recorder: MediaRecorder | null;

    // 0 for none, otherwise ID of the current transcript
    recording: number,
    chunks: Blob[],

    setRecorder: (recorder: MediaRecorder) => void;
    startRecording: (id: number) => void;
    stopRecording: () => void;
    getStatus: () => AudioStatus;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
    recorder: null,
    recording: 0,
    chunks: [],

    setRecorder: (recorder) => set({ recorder }),

    startRecording: async (id) => {
        let recorder = get().recorder;

        try {
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

        } catch (e) {
            // If recorder doesn't work, try resetting it
            if (!await initAudio(true)) {
                set({ recorder: null });
                console.log(e);
            }
        }
    },

    stopRecording: () => {
        const recorder = get().recorder;
        if (get().recording === 0 || !recorder) return;

        recorder.stop();
    },

    getStatus: () => {
        if (!get().recorder) { return "NoMic"; }
        else if (get().recording === 0) { return "Ready"; }
        else { return "Recording" }
    }
}));

export function playAudio(audio: HTMLAudioElement, start: number, end?: number) {
    // Set the audio's current time to the start point
    audio.currentTime = start;

    // Define a handler to stop the audio at the end time
    let stopHandler: (() => void) | null = null;

    if (typeof end === 'number') {
        stopHandler = () => {
            if (audio.currentTime >= end) {
                audio.pause();
                audio.removeEventListener('timeupdate', stopHandler!);
            }
        };
        audio.addEventListener('timeupdate', stopHandler);
    }

    // Start playback
    audio.play().catch((err) => {
        console.error('Error playing audio:', err);
    });
}

export function formatTimestamp(ms: number): string {
    const totalMs = Math.floor(ms);
    const hours = (totalMs / 3600000) | 0;
    const minutes = ((totalMs % 3600000) / 60000) | 0;
    const seconds = ((totalMs % 60000) / 1000) | 0;

    return (
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds
    );
}


// Start the app by prompting for mic access
initAudio(false);