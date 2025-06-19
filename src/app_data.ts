export interface TranscriptData {
    speaker: string, 
    timing: number,
    content: string
}

export interface TabData {
    name: string,
    id: number,
}

export interface TabsState {
    SelectedTab: number,
    Tabs: Array<TabData>,
}

const LoadedTranscripts = new Map<number, Array<TranscriptData>>([
    [0, [{speaker: "John Doe", timing: 0, content: "This is a placeholder entry"}, 
        {speaker: "Jane Doe", timing: 1, content: "This is for testing purposes"},
        {speaker: "John Doe", timing: 2, content: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.".repeat(5)},
        {speaker: "Jane Doe", timing: 3, content: "Wow, that was long!"},]]
]);

export async function Load(id: number) : Promise<Array<TranscriptData>> {
    let transcript = LoadedTranscripts.get(id);
    if (transcript) return transcript;
     
    // If not cached, load from the server 
    transcript = await LoadFromServer(id);

    if (!transcript) throw Error("Error loading data");

    LoadedTranscripts.set(id, transcript);
    return transcript;
}

export function Create(id: number) {
    LoadedTranscripts.set(id, []);
}

//TODO: replace with network_client.ts
async function LoadFromServer(id: number) {
    return [{
        speaker: "Nobody",
        timing: 0,
        content: "",
    }]
}