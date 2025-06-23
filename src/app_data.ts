import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type TranscriptData = {
    id: number,
    title: string,
    time: number,
    audio: string,

    transcript: TranscriptEntry[],
}

export type TranscriptEntry = {
    speaker: string, 
    timing: number,
    content: string
}

export interface TabsState {
    SelectedTab: number,
    Tabs: TranscriptData[],
}

interface TranscriptStore {
    transcripts: Record<number, TranscriptData>;

    loadTranscript: (id: number) => Promise<TranscriptData>;
    addTranscript: (transcript: TranscriptData) => void;
    updateTranscript: (id: number, updates: Partial<Omit<TranscriptData, 'id'>>) => void;
    removeTranscript: (id: number) => void;

    updateTranscriptTitle: (id: number, title: string) => void;
    updateTranscriptTime: (id: number, time: number) => void;
    updateTranscriptAudio: (id: number, audio: string) => void;

    addTranscriptEntry: (id: number, entry: TranscriptEntry) => void;
    updateTranscriptEntry: (id: number, entryIndex: number, updates: Partial<TranscriptEntry>) => void;
    removeTranscriptEntry: (id: number, entryIndex: number) => void;
    setTranscriptEntries: (id: number, entries: TranscriptEntry[]) => void;
}

export const useTranscriptStore = create<TranscriptStore>()(
    subscribeWithSelector((set, get) => ({
        transcripts: {
            1: {
                id: 1,
                title: "Placeholder Transcript",
                time: 0,
                audio: "",
                transcript: [{speaker: "John Doe", timing: 0, content: "This is a placeholder entry"}, 
                    {speaker: "Jane Doe", timing: 1, content: "This is for testing purposes"},
                    {speaker: "John Doe", timing: 2, content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.".repeat(5)},
                    {speaker: "Jane Doe", timing: 3, content: "Wow, that was long!"}
                ]
            }
        },

        loadTranscript: async (id: number) => {
            const transcript = await tryLoad(id);

            if (!transcript) {
                throw new Error("Unable to fetch data");
            }

            set((state) => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: transcript
                }
            }))
            return transcript;
        },
    
        addTranscript: (transcript: TranscriptData) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [transcript.id]: transcript
                }
            })),
    
        updateTranscript: (id: number, updates: Partial<Omit<TranscriptData, 'id'>>) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        ...updates
                    } : state.transcripts[id]
                }
            })),
        
        removeTranscript: (id: number) =>
            set(state => {
                const { [id]: removed, ...remaining } = state.transcripts;
                return { transcripts: remaining };
            }),
        
        updateTranscriptTitle: (id: number, title: string) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        title
                    } : state.transcripts[id]
                }
            })),
        
        updateTranscriptTime: (id: number, time: number) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        time
                    } : state.transcripts[id]
                }
            })),
        
        updateTranscriptAudio: (id: number, audio: string) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        audio
                    } : state.transcripts[id]
                }
            })),
        
        addTranscriptEntry: (id: number, entry: TranscriptEntry) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        transcript: [...state.transcripts[id].transcript, entry]
                    } : state.transcripts[id]
                }
            })),
        
        updateTranscriptEntry: (id: number, entryIndex: number, updates: Partial<TranscriptEntry>) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        transcript: state.transcripts[id].transcript.map((entry, index) =>
                            index === entryIndex ? { ...entry, ...updates } : entry
                        )
                    } : state.transcripts[id]
                }
            })),
        
        removeTranscriptEntry: (id: number, entryIndex: number) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        transcript: state.transcripts[id].transcript.filter((_, index) => index !== entryIndex)
                    } : state.transcripts[id]
                }
            })),
        
        setTranscriptEntries: (id: number, entries: TranscriptEntry[]) =>
            set(state => ({
                transcripts: {
                    ...state.transcripts,
                    [id]: state.transcripts[id] ? {
                        ...state.transcripts[id],
                        transcript: entries
                    } : state.transcripts[id]
                }
            })),
        }))
);

//TODO: Put in network_client.ts
async function tryLoad(id: number) {
    return {
        id: 2,
        title: "Placeholder Transcript",
        time: 0,
        audio: "",
        transcript: [{speaker: "John Doe", timing: 0, content: "This is a placeholder entry"}, 
            {speaker: "Jane Doe", timing: 1, content: "This is for testing purposes"},
            {speaker: "John Doe", timing: 2, content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.".repeat(5)},
            {speaker: "Jane Doe", timing: 3, content: "Wow, that was long!"}
        ]
    }
}