import { useEffect, useRef, useState, useCallback } from 'react'
import { useMetadataStore, useTranscriptContentStore, useLoadFullTranscript, type TranscriptEntry } from './transcript_data'
import { formatTimestamp, playAudio, useAudioStore } from '../utils/audio'
import { EditableBox } from '../component/editable_box';
import { RecordButton } from './record_button';

import React from 'react';


import '../styles/workspace.css'



export function Workspace ({Tid, Wid} : {Tid: number, Wid: number}) {
    const loadFullTranscript = useLoadFullTranscript();

    const metadata = useMetadataStore(state => state.metadata[Tid]);
    const transcriptContent = useTranscriptContentStore(state => state.transcriptContent[Tid]);

    const transcriptRefs = useRef<HTMLDivElement[]>([]);
    const searchQuery = useRef("");
    const [searchState, setSearchState] = useState({ 
        results: [] as number[], 
        currentIndex: -1 
    });
 
    const audioRef = useRef<HTMLAudioElement | null>(null);

 
    // Load transcript if not already in store
    useEffect(() => {    
        if (!metadata || !transcriptContent) {
            loadFullTranscript(Tid).catch(err => console.error(err));
        }
    }, [Tid, metadata, transcriptContent, loadFullTranscript]);

    useEffect(() => {
        const load = async () => {
            // Only load audio if we have the transcript content and audio URL
            if (!transcriptContent?.audio) {
                console.log("No audio URL available yet");
                return;
            }

            try {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }

                const newAudio = new Audio(transcriptContent.audio);
                
                // Wait for audio to be ready
                await new Promise((resolve, reject) => {
                    newAudio.oncanplaythrough = resolve;
                    newAudio.onerror = reject;
                    newAudio.load();
                });

                audioRef.current = newAudio;
                console.log("Loaded audio successfully!");
            } catch (error) {
                console.error("Failed to load audio:", error);
            }
        };

        load();
    }, [transcriptContent?.audio]);

    // Reset search when transcript ID changes
    useEffect(() => {
        searchQuery.current = "";
        setSearchState({ results: [], currentIndex: -1 });
    }, [Tid]);

    // Called when the search is changed
    const handleSearch = (query: string) => {
        searchQuery.current = query;

        if (!query.trim()) {
            setSearchState({
                results: [],
                currentIndex: -1,
            });
            return;
        }

        // Find all matching transcript entries
        const results = transcriptContent.transcript.map((entry, index) => 
                entry.content.toLowerCase().includes(query.toLowerCase()) ? index : -1
            ).filter(
                index => index !== -1
            );

        // Navigate to first result if any found
        if (results.length > 0) {
            const firstResultIndex = results[0];
            transcriptRefs.current[firstResultIndex]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });

            setSearchState({
                results: results,
                currentIndex: 0,
            });

        } else {
            setSearchState({
                results: [],
                currentIndex: -1,
            });;
        }
    };
 
    // Gets next search result
    const handleNext = () => {
        if (searchState.results.length === 0) return;
        
        const nextIndex = (searchState.currentIndex + 1) % searchState.results.length;
        const nextResultIndex = searchState.results[nextIndex];
        
        setSearchState(prev => ({ ...prev, currentIndex: nextIndex }));
        transcriptRefs.current[nextResultIndex]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Gets previous search result
    const handlePrev = () => {
        if (searchState.results.length === 0) return;
        
        const prevIndex = searchState.currentIndex === 0 ? searchState.results.length - 1 : searchState.currentIndex - 1;
        const prevResultIndex = searchState.results[prevIndex];
        
        setSearchState(prev => ({ ...prev, currentIndex: prevIndex }));
        transcriptRefs.current[prevResultIndex]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Optimization: makes stable references for memoization
    const getTranscriptRef = useCallback((index: number) => {
        return (e: HTMLDivElement) => {
            transcriptRefs.current[index] = e;
        };
    }, []);

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
                    
                    <div id="SearchBox" key={Tid /*To force rerender*/}>
                        <input id="SearchInput"
                            type='text'
                            placeholder="Search..."
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        <div>
                            <button onClick={()=> handlePrev()}>▲</button>
                            <button onClick={()=> handleNext()}>▼</button>
                        </div>
                    </div>

                    <div style={{fontSize: '10px', height: '0', margin: '0'}}>
                        {searchQuery.current.length === 0 
                            ? ""
                            : searchState.currentIndex === -1 
                                ? "No Results Found" 
                                : `${searchState.currentIndex + 1} of ${searchState.results.length} results`
                        }
                    </div>
                </div>
                
                <RecordButton Tid={Tid} />
            </div>

            <div id="TranscriptBox">
                {transcriptContent.transcript.map(
                    (data, index) => {
                        const endTime = transcriptContent.transcript[index + 1]?.timing;

                        return (
                            <TranscriptEntryComponent
                                ref={getTranscriptRef(index)}
                                Tid={Tid}
                                index={index} 
                                data={data} 
                                selected={searchState.currentIndex >= 0 && searchState.results[searchState.currentIndex] === index}
                                playCallback={() => {
                                    if (audioRef.current) playAudio(audioRef.current, data.timing, endTime)
                                }}
                            />
                        )

                    }
                )} 
            </div>
        </div>
    )
}

const TranscriptEntryComponent = React.memo(
    function TranscriptEntryComponent({ playCallback, Tid, index, data, selected, ref }: {
        playCallback: () => void,
        Tid: number, 
        index: number,
        data: TranscriptEntry,
        selected: boolean,
        ref: (e: HTMLDivElement) => void,
    }) {
        const saveEdit = useTranscriptContentStore(state => state.updateTranscriptEntry);

        return (
            <div
                className={`Transcript ${selected ? "Selected" : ""}`}
                ref={ref}
            >
                <div className="ReplayButton"
                    onClick={playCallback}
                >
                    <img src="/play-fill.svg" />
                </div>

                <div className="TranscriptL">
                    <div className="SpeakerTag">{data.speaker}</div>
                    <div className="TimestampTag">{formatTimestamp(data.timing)}</div>
                </div>

                <div className="TranscriptR">
                    <EditableBox value={data.content} 
                        onSave={(updated)=>{saveEdit(Tid, index, {content: updated})}}
                    /> 
                </div>
            </div>
        );
    }, (prevProps, nextProps) => {
        // We skip memoizing if selected
        if (prevProps.selected || nextProps.selected) return false;

        return (
            prevProps.data === nextProps.data &&
            prevProps.ref === nextProps.ref
        );
    }
);