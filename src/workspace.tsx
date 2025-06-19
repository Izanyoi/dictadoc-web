import { useState, useEffect, useRef } from 'react';
import { type TranscriptData, Load } from './app_data';

import './styles/workspace.css'

declare global {
    interface Window {
        forceUpdate: () => void;
    }
}

export function Workspace ({wId} : {wId: number}) {
    const [ Transcripts, setTranscripts ] = useState<TranscriptData[]>([]);

    const transcriptRefs = useRef<(HTMLDivElement | null)[]>([]);
    const searchQuery = useRef("");
    const searchIndex = useRef(0);

    // For testing purposes, remove later
    window.forceUpdate = () => {
        const copy = Transcripts.slice(0);
        copy.push({
            speaker: "Name",
            timing: 90,
            content: "This was pushed via forceUpdate()"
        });
        setTranscripts(copy);
    };

    // Loads in the transcript
    useEffect(() => {
        const fetchData = async () => {
            const data = await Load(wId);
            setTranscripts(data);
        };

        fetchData();
    }, [wId]);

    // Called when the search is changed
    const handleSearch = (query: string) => {
        searchIndex.current = 0;
        searchQuery.current = query;

        const index = Transcripts.findIndex(t => 
            t.content.toLowerCase().includes(query.toLowerCase())
        );

        if (index !== -1 && transcriptRefs.current[index]) {
            transcriptRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchIndex.current = index;
        }
    };
 
    // Gets next search result
    const handleNext = () => {
        for (let i = searchIndex.current + 1; i < Transcripts.length; i++) {
            if (Transcripts[i].content.toLowerCase().includes(searchQuery.current.toLowerCase())) {
                transcriptRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                searchIndex.current = i;

                return;
            }
        }

        console.log("No Hits");
    }

    // Gets previous search result
    const handlePrev = () => {
        for (let i = searchIndex.current - 1; i >= 0; i--) {
            if (Transcripts[i].content.toLowerCase().includes(searchQuery.current.toLowerCase())) {
                transcriptRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                searchIndex.current = i;

                return;
            }
        }

        console.log("No Hits");
    }


    return (
        <div id='Main'>
            <div id='TopBar'>
                <div id="TranscriptName">
                    <h2>Transcript Name</h2>
                    <p>16/06/2025</p>
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
                
                <div id="RecordButton">
                    <img src='/mic.svg' />
                    Record 
                </div>
            </div>

            <div id="TranscriptBox">
                {Transcripts.map(
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