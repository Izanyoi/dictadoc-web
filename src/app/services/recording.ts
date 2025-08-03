import { create } from 'zustand'
import { useTranscriptContentStore } from '../data/transcript_data';
import { usePlaybackStore } from '../services/audio_playback';
import { useWebSocketStore } from '../../utils/websocket';

const SEND_INTERVAL_MS = 60000;
const AUDIO_MIME_TYPE = "audio/webm;codecs=opus";

type MicStatus = "NoMic" | "Recording" | "Ready";

async function sendAudioChunk(blob: Blob, sequenceId: number) {
    const websocketSend = useWebSocketStore.getState().send;
    const arrayBuffer = await blob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    websocketSend(JSON.stringify({
        type: 'audio',
        sequence: sequenceId,
        data: base64Audio,
        timestamp: Date.now()
    }));
}

function sendEndMessage(sequenceId: number) {
    const websocketSend = useWebSocketStore.getState().send;

    websocketSend(JSON.stringify({
        type: 'end',
        sequence: sequenceId,
        timestamp: Date.now()
    }));
}

type RecordingStore = {
    recorder: MediaRecorder | null;
    stream: MediaStream | null;
    recording: string | null;
    chunks: Blob[];
    
    initRecorder: () => Promise<boolean>;
    startRecording: (id: string) => Promise<void>;
    stopRecording: () => void;
    cleanup: () => void;
    getStatus: () => MicStatus;
};

class RecorderManager {
    private intervalId: number | null = null;
    private lastSent = 0;
    private sequenceId = 0;

    async init(set: any, get: any): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: AUDIO_MIME_TYPE });
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    set((state: RecordingStore) => ({ chunks: [...state.chunks, e.data] }));
                }
            };

            recorder.onstart = () => this.startSending(get);
            recorder.onstop = () => this.handleStop(set, get);

            set({ recorder, stream });
            return true;
        } catch {
            return false;
        }
    }

    private startSending(get: any) {
        this.lastSent = 0;
        this.sequenceId = 0;
        
        this.intervalId = window.setInterval(() => {
            const { chunks } = get();
            if (chunks.length > this.lastSent) {
                const newChunks = chunks.slice(this.lastSent);
                const blob = new Blob(newChunks, { type: AUDIO_MIME_TYPE });
                sendAudioChunk(blob, this.sequenceId);
                this.lastSent = chunks.length;
                this.sequenceId++;
            }
        }, SEND_INTERVAL_MS);
    }

    private handleStop(set: any, get: any) {
        const websocketDisconnect = useWebSocketStore.getState().disconnect;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        const { chunks, recording } = get();
        if (chunks.length > 0 && recording) {
            const newChunks = chunks.slice(this.lastSent);
            const lastBlob = new Blob(newChunks, { type: AUDIO_MIME_TYPE });
            sendAudioChunk(lastBlob, this.sequenceId);
            sendEndMessage(this.sequenceId++);
            websocketDisconnect();

            const fullAudio = new Blob(chunks, { type: AUDIO_MIME_TYPE });
            useTranscriptContentStore.getState().updateTranscriptAudio(recording, fullAudio);
            usePlaybackStore.getState().loadAudio(recording, fullAudio);
        }

        set({ recording: null, chunks: [] });
        this.lastSent = 0;
    }

    cleanup(set: any, get: any) {
        const { stream, recorder } = get();
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (recorder?.state === "recording") {
            recorder.stop();
        }

        stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        set({ recorder: null, stream: null, recording: null, chunks: [] });
    }
}

const manager = new RecorderManager();

export const useRecordingStore = create<RecordingStore>((set, get) => ({
    recorder: null,
    stream: null,
    recording: null,
    chunks: [],

    initRecorder: () => manager.init(set, get),

    startRecording: async (id) => {
        if (get().recording) return;
        
        let { recorder } = get();
        if (!recorder) {
            await manager.init(set, get);
            recorder = get().recorder;
        }

        if (recorder) {
            set({ recording: id, chunks: [] });
            recorder.start(1000);
        }
    },

    stopRecording: () => {
        const { recorder } = get();
        if (recorder?.state === "recording") {
            recorder.stop();
        }
    },

    cleanup: () => manager.cleanup(set, get),

    getStatus: () => {
        const { recorder, recording } = get();
        if (!recorder) return "NoMic";
        return recording ? "Recording" : "Ready";
    }
}));

// Auto-initialize
manager.init(useRecordingStore.setState, useRecordingStore.getState);