import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Shared types
export type TranscriptEntry = {
    speaker: string, 
    timing: number,
    content: string
}

// Metadata types
export type TranscriptMetadata = {
    id: number,
    title: string,
    time: number,
}

// Transcript content types
export type TranscriptContent = {
    id: number,
    audio: string,
    transcript: TranscriptEntry[],
}

// Metadata Store
type MetadataStore = {
    metadata: Record<number, TranscriptMetadata>;

    loadMetadata: (id: number) => Promise<TranscriptMetadata>;
    addMetadata: (metadata: TranscriptMetadata) => void;
    updateMetadata: (id: number, updates: Partial<Omit<TranscriptMetadata, 'id'>>) => void;
    removeMetadata: (id: number) => void;

    updateTranscriptTitle: (id: number, title: string) => void;
    updateTranscriptTime: (id: number, time: number) => void;
}

export const useMetadataStore = create<MetadataStore>()(
    subscribeWithSelector((set, get) => ({
        metadata: {
            1: {
                id: 1,
                title: "Placeholder Transcript",
                time: 0,
            },
            2: {
                id: 2,
                title: "Team Meeting Discussion",
                time: 1800,
            }
        },

        loadMetadata: async (id: number) => {
            const data = await tryLoad(id);
            const metadata = {
                id: data.id,
                title: data.title,
                time: data.time,
            };

            set((state) => ({
                metadata: {
                    ...state.metadata,
                    [id]: metadata
                }
            }))
            return metadata;
        },
    
        addMetadata: (metadata: TranscriptMetadata) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [metadata.id]: metadata
                }
            })),
    
        updateMetadata: (id: number, updates: Partial<Omit<TranscriptMetadata, 'id'>>) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        ...updates
                    } : state.metadata[id]
                }
            })),
        
        removeMetadata: (id: number) =>
            set(state => {
                const { [id]: removed, ...remaining } = state.metadata;
                return { metadata: remaining };
            }),
        
        updateTranscriptTitle: (id: number, title: string) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        title
                    } : state.metadata[id]
                }
            })),
        
        updateTranscriptTime: (id: number, time: number) =>
            set(state => ({
                metadata: {
                    ...state.metadata,
                    [id]: state.metadata[id] ? {
                        ...state.metadata[id],
                        time
                    } : state.metadata[id]
                }
            })),
    }))
);

// Transcript Content Store
type TranscriptContentStore = {
    transcriptContent: Record<number, TranscriptContent>;

    loadTranscriptContent: (id: number) => Promise<TranscriptContent>;
    addTranscriptContent: (content: TranscriptContent) => void;
    updateTranscriptContent: (id: number, updates: Partial<Omit<TranscriptContent, 'id'>>) => void;
    removeTranscriptContent: (id: number) => void;

    updateTranscriptAudio: (id: number, audio: string) => void;

    addTranscriptEntry: (id: number, entry: TranscriptEntry) => void;
    updateTranscriptEntry: (id: number, entryIndex: number, updates: Partial<TranscriptEntry>) => void;
    removeTranscriptEntry: (id: number, entryIndex: number) => void;
    setTranscriptEntries: (id: number, entries: TranscriptEntry[]) => void;
}

export const useTranscriptContentStore = create<TranscriptContentStore>()(
    subscribeWithSelector((set, get) => ({
        transcriptContent: {
            1: {
                id: 1,
                audio: "",
                transcript: [
                    {speaker: "John Doe", timing: 0, content: "This is a placeholder entry"}, 
                    {speaker: "Jane Doe", timing: 1, content: "This is for testing purposes"},
                    {speaker: "John Doe", timing: 2, content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.".repeat(5)},
                    {speaker: "Jane Doe", timing: 3, content: "Wow, that was long!"}
                ]
            },
            2: {
                id: 2,
                audio: "meeting-audio-file.mp3",
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
            }
        },

        loadTranscriptContent: async (id: number) => {
            const data = await tryLoad(id);
            const content = {
                id: data.id,
                audio: data.audio,
                transcript: data.transcript,
            };

            set((state) => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: content
                }
            }))
            return content;
        },
    
        addTranscriptContent: (content: TranscriptContent) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [content.id]: content
                }
            })),
    
        updateTranscriptContent: (id: number, updates: Partial<Omit<TranscriptContent, 'id'>>) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        ...updates
                    } : state.transcriptContent[id]
                }
            })),
        
        removeTranscriptContent: (id: number) =>
            set(state => {
                const { [id]: removed, ...remaining } = state.transcriptContent;
                return { transcriptContent: remaining };
            }),
        
        updateTranscriptAudio: (id: number, audio: string) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        audio
                    } : state.transcriptContent[id]
                }
            })),
        
        addTranscriptEntry: (id: number, entry: TranscriptEntry) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        transcript: [...state.transcriptContent[id].transcript, entry]
                    } : state.transcriptContent[id]
                }
            })),
        
        updateTranscriptEntry: (id: number, entryIndex: number, updates: Partial<TranscriptEntry>) =>
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
        
        removeTranscriptEntry: (id: number, entryIndex: number) =>
            set(state => ({
                transcriptContent: {
                    ...state.transcriptContent,
                    [id]: state.transcriptContent[id] ? {
                        ...state.transcriptContent[id],
                        transcript: state.transcriptContent[id].transcript.filter((_, index) => index !== entryIndex)
                    } : state.transcriptContent[id]
                }
            })),
        
        setTranscriptEntries: (id: number, entries: TranscriptEntry[]) =>
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

// Utility hook to load both metadata and content together
export const useLoadFullTranscript = () => {
    const loadMetadata = useMetadataStore(state => state.loadMetadata);
    const loadTranscriptContent = useTranscriptContentStore(state => state.loadTranscriptContent);

    return async (id: number) => {
        const [metadata, content] = await Promise.all([
            loadMetadata(id),
            loadTranscriptContent(id)
        ]);
        
        return {
            ...metadata,
            ...content
        };
    };
};

// Utility hook to add both metadata and content together
export const useAddFullTranscript = () => {
    const addMetadata = useMetadataStore(state => state.addMetadata);
    const addTranscriptContent = useTranscriptContentStore(state => state.addTranscriptContent);

    return (transcript: {
        id: number,
        title: string,
        time: number,
        audio: string,
        transcript: TranscriptEntry[]
    }) => {
        const metadata: TranscriptMetadata = {
            id: transcript.id,
            title: transcript.title,
            time: transcript.time,
        };
        
        const content: TranscriptContent = {
            id: transcript.id,
            audio: transcript.audio,
            transcript: transcript.transcript,
        };

        addMetadata(metadata);
        addTranscriptContent(content);
    };
};

// Utility hook to remove both metadata and content together
export const useRemoveFullTranscript = () => {
    const removeMetadata = useMetadataStore(state => state.removeMetadata);
    const removeTranscriptContent = useTranscriptContentStore(state => state.removeTranscriptContent);

    return (id: number) => {
        removeMetadata(id);
        removeTranscriptContent(id);
    };
};

//TODO: Put in network_client.ts
async function tryLoad(id: number) {
    return {
        id: 2,
        title: "Placeholder Transcript",
        time: 0,
        audio: "",
        transcript: [
            {speaker: "John Doe", timing: 0, content: "This is a placeholder entry"}, 
            {speaker: "Jane Doe", timing: 1, content: "This is for testing purposes"},
            {speaker: "John Doe", timing: 2, content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.".repeat(5)},
            {speaker: "Jane Doe", timing: 3, content: "Wow, that was long!"}
        ]
    };
}