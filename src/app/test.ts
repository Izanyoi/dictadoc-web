import { createNewTranscript } from "./data/transcript_data";
import { useTranscriptContentStore } from "./data/transcript_data";

export function createTestTranscript() {
    const id = createNewTranscript();
    const addTranscriptEntry = useTranscriptContentStore.getState().addTranscriptEntry;

    addTranscriptEntry(id, {
        speaker: "John Doe",
        timing: 0,
        content: "This is the first entry."
    });

    addTranscriptEntry(id, {
        speaker: "Jane Doe",
        timing: 1,
        content: "This is the second entry."
    });

    addTranscriptEntry(id, {
        speaker: "Jane Doe",
        timing: 2,
        content: "This is the third entry."
    });

    return id;
}