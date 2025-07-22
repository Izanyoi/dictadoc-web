// Shared types
export type TranscriptEntry = {
    speaker: string, 
    timing: number,
    content: string
}

// Metadata types
export type TranscriptMetadata = {
    id: string,
    title: string,
    time: number,
}

// Transcript content types
export type TranscriptContent = {
    id: string,
    audio: Blob | null,
    transcript: TranscriptEntry[],
}

// TS type to help pass data
export type Transcript = {
    id?: string,
    title?: string,
    time?: number,
    audio?: Blob | null,
    transcript?: TranscriptEntry[],
}