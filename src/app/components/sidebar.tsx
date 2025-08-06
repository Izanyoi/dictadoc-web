import { memo, useState } from "react";
import { usePopupStore, useWorkspaceState } from "../data/app_data";
import { addNewTranscript, createNewTranscript, useMetadataStore } from "../data/transcript_data";
import { decodeTranscriptZip } from "../services/transcript_file";
import { useRecordingStore } from "../services/recording";

import '../styles/sidebar.css'


export function Sidebar() {
    const metadata = useMetadataStore(state => state.metadata);
    const openPopup = usePopupStore(state => state.openPopup);

    const [filters, setFilters] = useState({
        search: '',
        tag: '',
        dateRange: { start: null, end: null },
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = e.currentTarget.value;
            const newTags = value.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];
            const cleaned = value.replace(/#\w+/g, '').trim();

            setFilters({
                ...filters,
                search: cleaned,
                tag: newTags[0] ?? '',
            })
        }
    };

    const filteredAndSorted = Object.values(metadata || {})
        .filter(entry => {
            if (!entry) return false;

            // Search filter
            if (filters.search && !entry.title?.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Tag filter
            if (filters.tag && !entry.tags?.includes(filters.tag)) {
                return false;
            }

            // Date range filter
            if (filters.dateRange.start && entry.time < filters.dateRange.start) {
                return false;
            }
            if (filters.dateRange.end && entry.time > filters.dateRange.end) {
                return false;
            }

            return true;
        })
        .sort((a, b) => (b.time || 0) - (a.time || 0));

    const workspaceStore = useWorkspaceState();

    return (
        <div id="Sidebar">
            <div id="Logo">
                <img src="https://placehold.co/400" />
                v0.1a
            </div>

            <div id="Controls">
                <div className="Link"
                    onClick={()=>openPopup("Settings", null)}
                >
                    <svg /* Settings */
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="currentColor"
                        width="30" height="30" viewBox="0 0 16 16"
                    >
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                </div>

                <div className="Link"
                    onClick={()=>openPopup("Account", null)}
                >
                    <svg /* Account */
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        width="30" height="30" viewBox="0 0 16 16"
                    >
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                    </svg>
                </div>

                <div className="Link"
                    onClick={()=>openPopup("Submit a Bug Report", null)}
                >
                    <svg /* Bug Report */
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        width="30" height="30" viewBox="0 0 16 16"
                    >
                        <path d="M4.978.855a.5.5 0 1 0-.956.29l.41 1.352A5 5 0 0 0 3 6h10a5 5 0 0 0-1.432-3.503l.41-1.352a.5.5 0 1 0-.956-.29l-.291.956A5 5 0 0 0 8 1a5 5 0 0 0-2.731.811l-.29-.956z"/>
                        <path d="M13 6v1H8.5v8.975A5 5 0 0 0 13 11h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 1 0 1 0v-.5a1.5 1.5 0 0 0-1.5-1.5H13V9h1.5a.5.5 0 0 0 0-1H13V7h.5A1.5 1.5 0 0 0 15 5.5V5a.5.5 0 0 0-1 0v.5a.5.5 0 0 1-.5.5zm-5.5 9.975V7H3V6h-.5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 0-1 0v.5A1.5 1.5 0 0 0 2.5 7H3v1H1.5a.5.5 0 0 0 0 1H3v1h-.5A1.5 1.5 0 0 0 1 11.5v.5a.5.5 0 1 0 1 0v-.5a.5.5 0 0 1 .5-.5H3a5 5 0 0 0 4.5 4.975"/>
                    </svg>
                </div>
            </div>

            <div className="Filters">
                <input
                    type="text"
                    placeholder="Search..."
                    onKeyDown={handleSearch}
                />
            </div>

            <NewTab />

            <div id="Entries">
                {filteredAndSorted.map(entry => (
                    <Tab 
                        Tid={entry.id} 
                        title={entry.title} 
                        selected={entry.id===workspaceStore.workspaces[0]}/>
                ))}
            </div>

            <div className="Warning"
                style={{
                    backgroundColor: "orange",
                    padding: "5px",
                }}>
                Please manually download the transcripts you want to keep. The web app does not save your data between sessions.
            </div>
        </div>
    );
}

function NewTab() {
    return (
        <div id="NewTab" 
            key={100}
        >
            <div className="Half FlatButton"
                onClick={() => {
                    const Tid = createNewTranscript();
                    useRecordingStore.getState().startRecording(Tid);
                    useWorkspaceState.getState().setWorkspace(0,Tid);
                }}
            >
                New Recording
            </div>
            <div className="Half FlatButton">
                <label htmlFor="file-upload" className="Centered VFlex">
                    Upload File
                </label>
                <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={async (e)=>{
                        if (!e.target.files) {
                            console.log("Upload Failed");
                            return;
                        }

                        const file = e.target.files[0];
                        const extractedTranscript = await decodeTranscriptZip(file);
                        const Tid = addNewTranscript(extractedTranscript);
                        useWorkspaceState.getState().setWorkspace(0,Tid);
                    }}
                />
            </div>
        </div>
    )
}

const Tab = memo(
    function Tab({Tid, title, selected}: {Tid: string, title: string, selected: boolean}) {
    const workspaceState = useWorkspaceState();
    
    if (!selected) return (
        <div className="Tab"
            key={Tid}
            onClick={()=>{workspaceState.setWorkspace(0, Tid)}}    
        >
            {title}
        </div>
    )
    else return (
        <div className="Tab Selected" key={Tid}>
            {title}
        </div>
    )
})