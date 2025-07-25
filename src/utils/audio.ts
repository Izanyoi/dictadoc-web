import { create } from 'zustand'
import { useTranscriptContentStore } from '../app/data/transcript_data';
import { useWebSocketStore } from './websocket_client';

const websocketRate = 60000;
let isStarting = false;
let lastSend = 0;

async function initAudio(): Promise<boolean> {
    const websocketSend = useWebSocketStore.getState().send;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const options = { mimeType: "audio/webm;codecs=opus" };
        const recorder = new MediaRecorder(stream, options);

        useRecordingStore.getState().stream = stream;
        useRecordingStore.getState().setRecorder(recorder);
        recorder.ondataavailable = (e: BlobEvent) => {
            useRecordingStore.setState((state) => ({
                chunks: [...state.chunks, e.data]
            }));
        };

        setInterval(() => {
            const { chunks } = useRecordingStore.getState();
            if (chunks.length > 0) {
                const audioBlob = new Blob(chunks.slice(lastSend), { type: "audio/webm;codecs=opus" });
                lastSend = chunks.length;
                websocketSend(audioBlob);
            }
        }, websocketRate);

        recorder.onstop = () => {
            const state = useRecordingStore.getState();
            const blob = new Blob(state.chunks, { type: "audio/webm;codecs=opus" });
            useTranscriptContentStore.getState().updateTranscriptAudio(state.recording??"", blob);
            useRecordingStore.setState({
                recording: null,
                chunks: [],
            });
        };
        return true;
    } catch (error) {
        console.error("Error accessing microphone:", error);
        return false;
    }
}

type MicStatus = "NoMic" | "Recording" | "Ready";

type RecordingStore = {
    recorder: MediaRecorder | null;
    stream: MediaStream | null;

    // null for none, otherwise ID of the current transcript
    recording: string | null,
    chunks: Blob[],

    setRecorder: (recorder: MediaRecorder) => void;
    startRecording: (id: string) => void;
    stopRecording: () => void;
    getStatus: () => MicStatus;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
    recorder: null,
    stream: null,
    recording: null,
    chunks: [],

    setRecorder: (recorder) => set({ recorder }),

    startRecording: async (Tid) => {
        // Prevents the async nature of this from allowing multiple calls
        if (isStarting || get().recording != null) return;
        isStarting = true;

        let recorder = get().recorder;

        try {
            // If no recorder exists, try creating one now
            if (!recorder) {
                const success = await initAudio();
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

            set({ recording: Tid, chunks: [] });
            recorder.start();
            console.log("Recording Started");

        } catch (e) {
            // If recorder doesn't work, try resetting it
            if (!await initAudio()) {
                // We give up
                set({ recorder: null });
                console.log(e);
            }
        } finally {
            isStarting = false;
        }
    },

    stopRecording: () => {
        const recorder = get().recorder;
        if (get().recording == null || !recorder) return;

        recorder.stop();
        console.log("Stopped recording")
    },

    getStatus: () => {
        if (!get().recorder) { return "NoMic"; }
        else if (get().recording == null) { return "Ready"; }
        else { return "Recording" }
    }
}));

// Start the app by prompting for mic access
initAudio();



/**********************/
// LIBRARY FUNCTIONS //
/*********************/

export function playAudio(audio: HTMLAudioElement, start: number, end?: number) {
    audio.currentTime = start;

    if (end) {
        const stopHandler = () => {
            if (audio.currentTime >= end) {
                audio.pause();
                audio.removeEventListener('timeupdate', stopHandler);
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

/**
 * You must manually clean up the howl reference after you're done with it using .cleanup on the returned
 * object otherwise you will cause a memory leak
 * @param blob - the audio blob to be wrapped in a Howl
 * @returns the associated Howl with cleanup method
 */
export function createHowl(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const howl = new Howl({
        src: [url],
        preload: true,
        format: ['mp3', 'wav', 'ogg'],
        onloaderror: (id, error) => {
            console.error('Failed to load audio:', error);
            cleanup();
        }
    });
   
    const cleanup = () => {
        howl.stop();
        howl.unload();
        URL.revokeObjectURL(url);
    };
   
    howl.on('loaderror', cleanup);
   
    // Expose cleanup for manual calling
    (howl as any).cleanup = cleanup;
   
    return howl;
}