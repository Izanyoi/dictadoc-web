import { useEffect, useRef, useCallback, memo } from 'react'
import { useMetadataStore, useTranscriptContentStore, useLoadFullTranscript, type TranscriptEntry } from './transcript_data'
import { createAudio, formatTimestamp, playAudio } from '../utils/audio'
import { EditableBox, EditableInput } from '../component/editable_box';
import { RecordButton } from './record_button';
import { useListSearch } from './search';

import '../styles/workspace.css'
import '../styles/presets.css'
import { DownloadButton } from './download_button';


export function Workspace ({Tid, Wid} : {Tid: number, Wid: number}) {
    const loadFullTranscript = useLoadFullTranscript();
    const saveTitle = useMetadataStore(state => state.updateTranscriptTitle);

    const metadata = useMetadataStore(state => state.metadata[Tid]);
    const transcriptContent = useTranscriptContentStore(state => state.transcriptContent[Tid]);

    const transcriptRefs = useRef<HTMLDivElement[]>([]);
    const search = useListSearch(
        transcriptContent?.transcript || [],
        (entry: TranscriptEntry, query: string) => entry.content.toLowerCase().includes(query.toLowerCase())
    );
 
    const audioRef = useRef<HTMLAudioElement | null>(null);

 
    // Load transcript if not already in store
    useEffect(() => {
        if (!metadata || !transcriptContent) {
            loadFullTranscript(Tid).catch(err => console.error(err));
        }
    }, [Tid, metadata, transcriptContent, loadFullTranscript]);

    useEffect(() => {
        const load = async () => {
            // Only load audio if we have the transcript audio
            if (!transcriptContent?.audio) {
                console.log("No audio available yet");
                return;
            }

            try {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }

                const newAudio = createAudio(transcriptContent.audio);
                
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
        search.reset();
    }, [Tid]);

    const scrollTo = (index: number) => {
        transcriptRefs.current[index]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Called when the search is changed
    const handleSearch = (query: string) => {
        const firstResultIndex = search.handleSearch(query);
        if (firstResultIndex >= 0) scrollTo(firstResultIndex);
    };
 
    // Gets next search result
    const handleNext = () => {
        const nextIndex = search.handleNext();
        if (nextIndex != -1) scrollTo(nextIndex);
    }

    // Gets previous search result
    const handlePrev = () => {
        const prevIndex = search.handlePrev();
        if (prevIndex != -1) scrollTo(prevIndex);
    }

    // Optimization: makes stable references for memoization
    const getTranscriptRef = useCallback((index: number) => {
        return (e: HTMLDivElement) => {transcriptRefs.current[index] = e;};
    }, []);


    return (
        <div id='Main'>
            <div id='TopBar'>
                <div className="TranscriptName">
                    <EditableInput value={metadata.title} onSave={(e) => saveTitle(Tid, e)} className="TranscriptName Title" />
                    <p>{new Date(metadata.time).toLocaleString()}</p>
                </div>
               
                <div id="CenterContainer">
                    <div className="connection-status">
                        <div className="status-dot"/>
                        <div>Connected</div>
                    </div>
                    
                    <div id="SearchBox" key={Tid} /* To force remount to clear search result */>
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
                        {search.searchQuery.length === 0 
                            ? ""
                            : search.searchState.currentIndex === -1 
                                ? "No Results Found" 
                                : `${search.searchState.currentIndex + 1} of ${search.searchState.results.length} results`
                        }
                    </div>
                </div>
                
                <div className='HFlex'>
                    <DownloadButton Tid={Tid}/>
                    <RecordButton Tid={Tid} />
                </div>
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
                                selected={search.searchState.currentIndex >= 0 
                                    && search.searchState.results[search.searchState.currentIndex] === index}
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

const TranscriptEntryComponent = memo(
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