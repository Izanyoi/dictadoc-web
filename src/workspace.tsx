import { useEffect, useRef } from 'react'
import { useMetadataStore, useTranscriptContentStore, useLoadFullTranscript } from './transcript_data'
import { useAudioStore } from './audio'

import './styles/workspace.css'

export function Workspace ({Tid, Wid} : {Tid: number, Wid: number}) {
    const metadata = useMetadataStore(state => state.metadata[Tid]);
    const transcriptContent = useTranscriptContentStore(state => state.transcriptContent[Tid]);
    const loadFullTranscript = useLoadFullTranscript();

    const transcriptRefs = useRef<(HTMLDivElement | null)[]>([]);
    const searchQuery = useRef("");
    const searchResults = useRef<number[]>([]);
    const currentSearchIndex = useRef(0);

    // Load transcript if not already in store
    useEffect(() => {    
        if (!metadata || !transcriptContent) {
            loadFullTranscript(Tid).catch(err => console.error(err));
        }
    }, [Tid, metadata, transcriptContent, loadFullTranscript]);

    // Early return if data is not loaded yet
    if (!metadata || !transcriptContent) {
        return <div>Loading...</div>;
    }

    // Called when the search is changed
    const handleSearch = (query: string) => {
        searchQuery.current = query;
        currentSearchIndex.current = 0;
        
        if (!query.trim()) {
            searchResults.current = [];
            return;
        }

        // Find all matching transcript entries
        searchResults.current = transcriptContent.transcript
            .map((entry, index) => 
                entry.content.toLowerCase().includes(query.toLowerCase()) ? index : -1
            )
            .filter(index => index !== -1);

        // Navigate to first result if any found
        if (searchResults.current.length > 0) {
            const firstResultIndex = searchResults.current[0];
            transcriptRefs.current[firstResultIndex]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    };
 
    // Gets next search result
    const handleNext = () => {
        if (searchResults.current.length === 0) {
            console.log("No search results");
            return;
        }

        currentSearchIndex.current = (currentSearchIndex.current + 1) % searchResults.current.length;
        const nextResultIndex = searchResults.current[currentSearchIndex.current];
        
        transcriptRefs.current[nextResultIndex]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Gets previous search result
    const handlePrev = () => {
        if (searchResults.current.length === 0) {
            console.log("No search results");
            return;
        }

        currentSearchIndex.current = currentSearchIndex.current === 0 
            ? searchResults.current.length - 1 
            : currentSearchIndex.current - 1;
            
        const prevResultIndex = searchResults.current[currentSearchIndex.current];
        
        transcriptRefs.current[prevResultIndex]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    return (
        <div id='Main'>
            <div id='TopBar'>
                <div id="TranscriptName">
                    <h2>{metadata.title}</h2>
                    <p>{metadata.time}</p>
                </div>
               
                <div id="CenterContainer">
                    <div className="connection-status">
                        <div className="status-dot"/>
                        <div>Connected</div>
                    </div>
                    
                    <div id="SearchBox">
                        <input id="SearchInput"
                            type='text'
                            placeholder="Search..."
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        <div>
                            <button onClick={()=> handlePrev()}>Prev</button>
                            <button onClick={()=> handleNext()}>Next</button>
                        </div>
                    </div>
                </div>
                
                <div id="RecordButton"
                    onClick={() => {useAudioStore.getState().startRecording(Tid)}}>
                    <img src='/mic.svg' />
                    Record 
                </div>
            </div>

            <div id="TranscriptBox">
                {transcriptContent.transcript.map(
                    (data, index) => {
                        return (
                            <div className="Transcript"
                                key={index}
                                ref={e => { transcriptRefs.current[index] = e; }}
                            >
                                <div className="ReplayButton">
                                    <img src='/play-fill.svg'/>
                                </div>

                                <div className="TranscriptL">
                                    <div className="SpeakerTag">{data.speaker}</div>
                                    <div className="TimestampTag">{data.timing}</div>
                                </div>

                                <div className="TranscriptR">
                                    {data.content}
                                </div>
                            </div>
                        )
                    }
                )}
            </div>
        </div>
    )
}