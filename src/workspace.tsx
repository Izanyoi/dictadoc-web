import { useEffect, useRef, useState, useCallback } from 'react'
import { useMetadataStore, useTranscriptContentStore, useLoadFullTranscript, type TranscriptEntry } from './transcript_data'
import { useAudioStore, formatTimestamp } from './audio'

import './styles/workspace.css'
import React from 'react';

export function Workspace ({Tid, Wid} : {Tid: number, Wid: number}) {
    const metadata = useMetadataStore(state => state.metadata[Tid]);
    const transcriptContent = useTranscriptContentStore(state => state.transcriptContent[Tid]);
    const loadFullTranscript = useLoadFullTranscript();

    const transcriptRefs = useRef<HTMLDivElement[]>([]);
    const searchQuery = useRef("");
    const [searchState, setSearchState] = useState({ 
        results: [] as number[], 
        currentIndex: -1 
    });

    // Load transcript if not already in store
    useEffect(() => {    
        if (!metadata || !transcriptContent) {
            loadFullTranscript(Tid).catch(err => console.error(err));
        }
    }, [Tid, metadata, transcriptContent, loadFullTranscript]);

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
                </div>
                
                <div id="RecordButton"
                    onClick={() => {useAudioStore().startRecording(Tid)}}
                >
                    <img src='/mic.svg' />
                    Record 
                </div>
            </div>

            <div id="TranscriptBox">
                {transcriptContent.transcript.map(
                    (data, index) => {
                        return (
                            <TranscriptEntryComponent 
                                key={index}
                                ref={getTranscriptRef(index)}
                                index={index} 
                                data={data} 
                                selected={searchState.currentIndex >= 0 && searchState.results[searchState.currentIndex] === index}
                            />
                        )
                    }
                )}
            </div>
        </div>
    )
}

const TranscriptEntryComponent = React.memo(
    function TranscriptEntryComponent({ index, data, selected, ref }: {
        index: number;
        data: TranscriptEntry;
        selected: boolean;
        ref: (e: HTMLDivElement) => void;
    }) {
        return (
            <div
                className={`Transcript ${selected ? "Selected" : ""}`}
                ref={ref}
            >
                <div className="ReplayButton">
                    <img src="/play-fill.svg" />
                </div>

                <div className="TranscriptL">
                    <div className="SpeakerTag">{data.speaker}</div>
                    <div className="TimestampTag">{formatTimestamp(data.timing)}</div>
                </div>

                <div className="TranscriptR">{data.content}</div>
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