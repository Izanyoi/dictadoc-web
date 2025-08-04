import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v7 as uuid } from 'uuid';
import { type TranscriptMetadata, type TranscriptContent, type TranscriptEntry } from '../data/types.ts';

type MetadataStore = {
    metadata: Record<string, TranscriptMetadata>;

    addMetadata: (metadata: TranscriptMetadata) => void;
    updateMetadata: (id: string, updates: Partial<Omit<TranscriptMetadata, 'id'>>) => void;
    removeMetadata: (id: string) => void;

    updateTranscriptTitle: (id: string, title: string) => void;
    updateTranscriptTime: (id: string, time: number) => void;
    updateTranscriptTags: (id: string, tags: string[]) => void;
}

export const useMetadataStore = create<MetadataStore>()(
    subscribeWithSelector((set, get) => ({
        metadata: {},
    
        addMetadata: (metadata: TranscriptMetadata) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [metadata.id]: metadata
                }
            })),
    
        updateMetadata: (id: string, updates: Partial<Omit<TranscriptMetadata, 'id'>>) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        ...updates
                    } : state.metadata[id]
                }
            })),
        
        removeMetadata: (id: string) =>
            set(state => {
                const { [id]: removed, ...remaining } = state.metadata;
                return { metadata: remaining };
            }),
        
        updateTranscriptTitle: (id: string, title: string) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        title
                    } : state.metadata[id]
                }
            })),
        
        updateTranscriptTime: (id: string, time: number) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        time
                    } : state.metadata[id]
                }
            })),

        updateTranscriptTags: (id: string, tags: string[]) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        tags
                    } : state.metadata[id]
                }
            })),
    }))
);

// Transcript Content Store
type TranscriptContentStore = {
    transcriptContent: Record<string, TranscriptContent>;

    addTranscriptContent: (content: TranscriptContent) => void;
    updateTranscriptContent: (id: string, updates: Partial<Omit<TranscriptContent, 'id'>>) => void;
    removeTranscriptContent: (id: string) => void;

    updateTranscriptAudio: (id: string, audio: Blob | null) => void;

    addTranscriptEntry: (id: string, entry: TranscriptEntry) => void;
    updateTranscriptEntry: (id: string, entryIndex: number, updates: Partial<TranscriptEntry>) => void;
    removeTranscriptEntry: (id: string, entryIndex: number) => void;
    setTranscriptEntries: (id: string, entries: TranscriptEntry[]) => void;
}

export const useTranscriptContentStore = create<TranscriptContentStore>()(
    subscribeWithSelector((set, get) => ({
        transcriptContent: {},
    
        addTranscriptContent: (content: TranscriptContent) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [content.id]: content
                }
            })),
    
        updateTranscriptContent: (id: string, updates: Partial<Omit<TranscriptContent, 'id'>>) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        ...updates
                    } : state.transcriptContent[id]
                }
            })),
        
        removeTranscriptContent: (id: string) =>
            set(state => {
                const { [id]: removed, ...remaining } = state.transcriptContent;
                return { transcriptContent: remaining };
            }),
        
        updateTranscriptAudio: (id: string, audio: Blob | null) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        audio
                    } : state.transcriptContent[id]
                }
            })),
        
        addTranscriptEntry: (id: string, entry: TranscriptEntry) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        transcript: [...state.transcriptContent[id].transcript, entry]
                    } : state.transcriptContent[id]
                }
            })),
        
        updateTranscriptEntry: (id: string, entryIndex: number, updates: Partial<TranscriptEntry>) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        transcript: state.transcriptContent[id].transcript.map((entry, index) =>
                            index === entryIndex ? { ...entry, ...updates } : entry
                        )
                    } : state.transcriptContent[id]
                }
            })),
        
        removeTranscriptEntry: (id: string, entryIndex: number) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        transcript: state.transcriptContent[id].transcript.filter((_, index) => index !== entryIndex)
                    } : state.transcriptContent[id]
                }
            })),
        
        setTranscriptEntries: (id: string, entries: TranscriptEntry[]) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        transcript: entries
                    } : state.transcriptContent[id]
                }
            })),
    }))
);

/**
 * React Hook that gets you all the data about the transcript. Updates the transcript for you. Use to subscribe to both stores[id]
 * @param id - transcript uuid
 */
export const useFullTranscript = (id: string) => {
    const metadata = useMetadataStore(state => state.metadata[id]);
    const transcriptContent = useTranscriptContentStore(state => state.transcriptContent[id]);

    return {
        metadata,
        ...transcriptContent,
    };
};

/**
 * Adds a new transcript to the stores
 * @param transcript - The ID-less transcript you want to add. Generates the ID.
 * @returns UUID of added transcript
 */
export function addNewTranscript(transcript: {
        title: string,
        time: number,
        tags: string[],
        audio: Blob | null,
        transcript: TranscriptEntry[]}) {

    const addMetadata = useMetadataStore.getState().addMetadata;
    const addTranscriptContent = useTranscriptContentStore.getState().addTranscriptContent;

    const id = uuid();
    const metadata: TranscriptMetadata = {
        id: id,
        title: transcript.title,
        time: transcript.time,
        tags: transcript.tags,
    };
    
    const content: TranscriptContent = {
        id: id,
        audio: transcript.audio,
        transcript: transcript.transcript,
    };

    addMetadata(metadata);
    addTranscriptContent(content);

    return id;
};

export function createNewTranscript() {
    const newTranscript = {
        title: "Untitled Transcript",
        time: Date.now(),
        tags: [],
        audio: null,
        transcript: [],
    }

    const id = addNewTranscript(newTranscript);
    return id;
};

/**
 * Removes a transcript from the stores
 * @param id - the ID of the transcript to be removed
 */
export function removeTranscript(id: string) {
    const removeMetadata = useMetadataStore.getState().removeMetadata;
    const removeTranscriptContent = useTranscriptContentStore.getState().removeTranscriptContent;

    removeMetadata(id);
    removeTranscriptContent(id);
};

//TODO: Put in network_client.ts
async function tryLoad(id: number) {
    return {
        id: id,
        title: "Placeholder Transcript",
        time: 0,
        audio: null,
        transcript: [
            {speaker: "Alex Rodriguez", timing: 0, content: "Good morning everyone, thanks for joining today's team meeting. Let's start with our quarterly review."}, 
            {speaker: "Sarah Chen", timing: 15, content: "I'd like to present the marketing metrics first. We've seen a 23% increase in user engagement this quarter."},
            {speaker: "Mike Johnson", timing: 45, content: "That's great news! From the engineering side, we've successfully deployed three major features and resolved 87% of our technical debt."},
            {speaker: "Alex Rodriguez", timing: 78, content: "Excellent work team. Sarah, can you elaborate on which campaigns drove the most engagement?"},
            {speaker: "Sarah Chen", timing: 95, content: "Absolutely. Our social media campaign 'Connect & Create' was the standout performer, generating 45% more clicks than our previous best. The video content particularly resonated with our target demographic of 25-34 year olds."},
            {speaker: "Mike Johnson", timing: 125, content: "Speaking of technical improvements, the new analytics dashboard is now live. It should give us better insights into user behavior patterns."},
            {speaker: "Lisa Wang", timing: 150, content: "From a design perspective, the user feedback has been overwhelmingly positive. The new interface reduced user confusion by 60% according to our usability tests."},
            {speaker: "Alex Rodriguez", timing: 180, content: "These are fantastic results across all departments. Let's discuss our goals for next quarter and how we can build on this momentum."}
        ]
    };
}