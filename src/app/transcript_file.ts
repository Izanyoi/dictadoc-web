import JSZip from 'jszip';
import { type Transcript, type TranscriptEntry, useMetadataStore, useTranscriptContentStore } from './transcript_data';

const version: string = "v1"

export async function createDownloadableTranscript(id: number): Promise<string> {
    const metadata = useMetadataStore.getState().metadata[id];
    const transcript = useTranscriptContentStore.getState().transcriptContent[id];

    const zip = new JSZip();

    const contents: string[] = ["DICTADOC", version];
    contents.push(metadata.title);
    contents.push(metadata.time.toString());

    transcript.transcript.forEach((entry) => {
        // Format: timing\0speaker\0content\0
        contents.push(entry.timing.toString());
        contents.push(entry.speaker);
        contents.push(entry.content);
    });

    const textBlob = contents.join('\0');

    zip.file('transcript.txt', textBlob);
    zip.file('audio.webm', transcript.audio)

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    return url;
}


export async function decodeTranscriptZip(zipBlob: Blob) {
    const zip = await JSZip.loadAsync(zipBlob);

    // Read transcript.txt
    const textData = await zip.file('transcript.txt')?.async('string');
    if (!textData) throw new Error('Transcript file missing');

    const parts = textData.split('\0');

    // Validate format
    if (parts[0] !== 'DICTADOC') {
        throw new Error('Invalid format or missing version header');
    }

    const version = parts[1];
    const title = parts[2];
    const time = Number(parts[3]);

    const entries: TranscriptEntry[] = [];

    // timing, speaker, content
    for (let i = 4; i < parts.length - 2; i += 3) {
        entries.push({
            timing: Number(parts[i]),
            speaker: parts[i + 1],
            content: parts[i + 2],
        });
    }

    const audioBlob = await zip.file('audio.webm')?.async('blob');
    if (!audioBlob) throw new Error('Audio file missing');

    return {
        title,
        time,
        audio: audioBlob,
        transcript: entries,
    };
}