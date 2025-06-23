import { useEffect, useRef } from 'react';
import { useTranscriptStore} from './app_data';
import { useAudioStore } from './audio';

import './styles/workspace.css'


export function Workspace ({Id} : {Id: number}) {
    const transcript = useTranscriptStore(state => state.transcripts[Id]);

    const transcriptRefs = useRef<(HTMLDivElement | null)[]>([]);
    const searchQuery = useRef("");
    const searchIndex = useRef(0);

    // Load transcript if not already in store
    useEffect(() => {    
        if (!transcript) {
            useTranscriptStore.getState().loadTranscript(Id).catch(err => console.error(err));
        }
    }, [Id, transcript]);

    // Called when the search is changed
    const handleSearch = (query: string) => {
        searchIndex.current = 0;
        searchQuery.current = query;

        const index = transcript.transcript.findIndex(t => 
            t.content.toLowerCase().includes(query.toLowerCase())
        );

        if (index !== -1 && transcriptRefs.current[index]) {
            transcriptRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchIndex.current = index;
        }
    };
 
    // Gets next search result
    const handleNext = () => {
        for (let i = searchIndex.current + 1; i < transcript.transcript.length; i++) {
            if (transcript.transcript[i].content.toLowerCase().includes(searchQuery.current.toLowerCase())) {
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
            if (transcript.transcript[i].content.toLowerCase().includes(searchQuery.current.toLowerCase())) {
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
                    <h2>{transcript.title}</h2>
                    <p>{transcript.time}</p>
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
                    onClick={() => {useAudioStore.getState().startRecording(Id)}}>
                    <img src='/mic.svg' />
                    Record 
                </div>
            </div>

            <div id="TranscriptBox">
                {transcript.transcript.map(
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