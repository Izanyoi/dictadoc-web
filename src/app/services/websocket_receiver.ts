import { useWebSocketStore } from "../../utils/websocket";
import { useTranscriptContentStore } from "../data/transcript_data";
import { type TranscriptEntry } from "../data/types";

useWebSocketStore.getState().setMessageHandler(handleMessage);

function handleMessage(message: string) {
    const websocket = useWebSocketStore.getState();

    try {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'add_transcript':
                const entries = parse(data.transcript);
                const addTranscriptEntry = useTranscriptContentStore.getState().addTranscriptEntry;
                
                if (data.id && entries.length > 0) {
                    for (const entry of entries) {
                        addTranscriptEntry(data.id, entry);
                    }
                }
                break;

            case 'notification':
                console.log('Notification:', data.payload);
                break;

            case 'end':
                websocket.disconnect();
                break;

            default:
                console.warn('Unknown message type:', data.type);
        }
    } catch (err) {
        console.error('Failed to parse message:', message, err);
    }
}

/**
 * Parses the message using the following expected format: {Speaker}\0{Timing}\0{Transcript}\0
 */
function parse(transcript: string): TranscriptEntry[] {
    if (!transcript) return [];

    const lines = transcript.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
        const parts = line.split('\0');
        if (parts.length !== 3) {
            console.warn('Invalid transcript line format:', line);
            return null;
        }
        const timing = parseInt(parts[1]);
        if (isNaN(timing)) {
            console.warn('Invalid timing in transcript line:', line);
            return null;
        }
        return {
            speaker: parts[0],
            timing: timing,
            content: parts[2]
        };
    }).filter((entry): entry is TranscriptEntry => entry !== null);
}